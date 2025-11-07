import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { SOA } from 'src/soa/soa.entities';
import { isAfter } from 'date-fns';
import { Billing, BillingStatus } from './billing.entities';
import { CommissionService } from 'src/comission/commission.service';
import { Between, In } from 'typeorm';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { User, UserRole } from 'src/user/user.entities';
import { NotificationsService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Billing)
    private readonly billingRepo: Repository<Billing>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(SOA)
    private readonly soaRepo: Repository<SOA>,

    @Inject(forwardRef(() => CommissionService)) // 👈 handle potential circular dep
    private readonly commissionService: CommissionService,

    private readonly notificationService: NotificationsService, // ✅
    private readonly notificationGateway: NotificationGateway, // ✅
  ) {}

  async create(dto: CreateBillingDto): Promise<Billing> {
    const soa = await this.soaRepo.findOne({ where: { id: dto.soaId } });
    if (!soa) throw new NotFoundException('SOA not found');

    const billing = this.billingRepo.create({
      ...dto,
      amountPaid: dto.amountPaid ?? 0,
      status: dto.status ?? BillingStatus.PENDING,
    });

    await this.billingRepo.save(billing);
    return this.findOne(billing.id);
  }

  findAll(): Promise<Billing[]> {
    return this.billingRepo.find({ relations: ['soa'] });
  }

  async findOne(id: number): Promise<Billing> {
    const billing = await this.billingRepo.findOne({
      where: { id },
      relations: ['soa'],
    });
    if (!billing) throw new NotFoundException(`Billing #${id} not found`);
    return billing;
  }

  // billing.service.ts (minimal, correct ordering)
  async update(id: number, dto: UpdateBillingDto): Promise<Billing> {
    const billing = await this.findOne(id);
    Object.assign(billing, dto);

    billing.status = this.calculateStatus(billing);

    // 1) Save billing first (persist updated amountPaid)
    await this.billingRepo.save(billing);

    // 2) Now update related SOA totals using persisted data
    if (dto.amountPaid !== undefined) {
      const soa = await this.soaRepo.findOne({ where: { id: billing.soaId } });
      if (soa) {
        const allBillings = await this.billingRepo.find({
          where: { soaId: soa.id },
        });
        const totalPaid = allBillings.reduce(
          (sum, b) => sum + Number(b.amountPaid),
          0,
        );

        soa.totalPaid = totalPaid;
        soa.balance = soa.totalPremium - totalPaid;
        await this.soaRepo.save(soa);

        // 3) Create commission AFTER billing has been saved and SOA updated.
        // CommissionService should check for existing commission to avoid duplicates.
        if (billing.amountPaid > 0) {
          await this.commissionService.createCommissionForBilling(billing.id);
        }
      }
    }

    // Return fresh billing
    return this.findOne(billing.id);
  }

  async remove(id: number): Promise<void> {
    await this.billingRepo.delete(id);
  }

  private calculateStatus(billing: Billing): BillingStatus {
    const now = new Date();

    if (billing.amountPaid >= billing.amount) return BillingStatus.PAID;
    if (billing.amountPaid === 0 && isAfter(now, billing.dueDate))
      return BillingStatus.LAPSED;
    if (billing.amountPaid < billing.amount && isAfter(now, billing.dueDate))
      return BillingStatus.OVERDUE;

    return BillingStatus.PENDING;
  }

  async getNearDueBillings(
    userId?: number,
    daysAhead: number = 5,
  ): Promise<Billing[]> {
    console.log('userId:', userId);
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid or missing userId in getNearDueBillings');
    }
    const now = new Date();
    const upcomingDate = addDays(now, daysAhead);
    console.log(upcomingDate, daysAhead);

    // Get user to determine access
    const user = userId
      ? await this.userRepository.findOne({
          where: { id: userId },
          relations: ['subordinates'],
        })
      : null;

    // 🟦 CASE 1: Super Admin or Admin - see all near due billings
    if (!user || [UserRole.ADMIN].includes(user.role)) {
      return this.billingRepo.find({
        where: {
          dueDate: Between(startOfDay(now), endOfDay(upcomingDate)),
          status: In([BillingStatus.PENDING, BillingStatus.OVERDUE]),
        },
        relations: ['soa', 'soa.policyHolder', 'soa.policyHolder.agent'],
      });
    }

    // 🟨 CASE 2: Supervisor - see all their agents' near due billings
    if (user.role === UserRole.COLLECTION_SUPERVISOR) {
      const agentIds = user.subordinates?.map((a) => a.id) ?? [];

      if (agentIds.length === 0) return [];

      return this.billingRepo.find({
        where: {
          dueDate: Between(startOfDay(now), endOfDay(upcomingDate)),
          status: In([BillingStatus.PENDING, BillingStatus.OVERDUE]),
          soa: { policyHolder: { agentId: In(agentIds) } },
        },
        relations: ['soa', 'soa.policyHolder', 'soa.policyHolder.agent'],
      });
    }

    // 🟩 CASE 3: Agent - see only his own near due billings
    if (user.role === UserRole.AGENT) {
      return this.billingRepo.find({
        where: {
          dueDate: Between(startOfDay(now), endOfDay(upcomingDate)),
          status: In([BillingStatus.PENDING, BillingStatus.OVERDUE]),
          soa: { policyHolder: { agentId: user.id } },
        },
        relations: ['soa', 'soa.policyHolder', 'soa.policyHolder.agent'],
      });
    }

    return [];
  }

  // 🕐 CRON JOB — runs daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoUpdateBillingStatuses(): Promise<void> {
    this.logger.log('Running daily billing status update...');

    const billings = await this.billingRepo.find();

    let updatedCount = 0;
    for (const billing of billings) {
      const newStatus = this.calculateStatus(billing);

      if (billing.status !== newStatus) {
        billing.status = newStatus;
        await this.billingRepo.save(billing);
        updatedCount++;
      }
    }

    this.logger.log(
      `Billing status update complete: ${updatedCount} records updated.`,
    );
  }

  // 🕒 CRON — Daily check for bills due soon or overdue
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron('*/10 * * * * *')
  async notifyUpcomingAndOverdueBills(): Promise<void> {
    this.logger.log('🔔 Checking for upcoming and overdue bills...');

    const today = startOfDay(new Date());

    // Get all billings that are not yet paid
    const billings = await this.billingRepo.find({
      where: { status: In([BillingStatus.PENDING, BillingStatus.OVERDUE]) },
      relations: ['soa', 'soa.policyHolder', 'soa.policyHolder.agent'],
    });

    for (const billing of billings) {
      const dueDate = startOfDay(new Date(billing.dueDate));
      const agent = billing.soa?.policyHolder?.agent;
      const clientName =
        billing.soa?.policyHolder?.firstName +
          ' ' +
          billing.soa?.policyHolder?.lastName || 'a client';

      if (!agent?.id) continue; // Skip if no assigned agent

      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let message: string | null = null;

      if (daysUntilDue === 3) {
        message = `Reminder: Your client ${clientName}'s bill is due in 3 days.`;
      } else if (daysUntilDue === 2) {
        message = `Reminder: Your client ${clientName}'s bill is due in 2 days.`;
      } else if (daysUntilDue === 1) {
        message = `Reminder: Your client ${clientName}'s bill is due tomorrow.`;
      } else if (daysUntilDue === 0) {
        message = `Reminder: Your client ${clientName}'s bill is due today.`;
      } else if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        message = `Alert: Your client ${clientName}'s bill is overdue by ${daysOverdue} day${
          daysOverdue > 1 ? 's' : ''
        }.`;
      }

      if (message) {
        const notification = await this.notificationService.create({
          userId: agent.id,
          title: 'Billing Reminder',
          message,
          link: `/policy-holder`,
        });

        this.notificationGateway.sendToUser(agent.id, notification);
        this.logger.log(
          `📨 Notified agent ${agent.id} about billing #${billing.id}`,
        );
      }
    }

    this.logger.log('✅ Billing reminders check complete.');
  }
}
