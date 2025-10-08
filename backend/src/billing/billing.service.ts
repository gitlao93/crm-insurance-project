import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { SOA } from 'src/soa/soa.entities';
import { isAfter } from 'date-fns';
import { Billing, BillingStatus } from './billing.entities';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Billing)
    private readonly billingRepo: Repository<Billing>,

    @InjectRepository(SOA)
    private readonly soaRepo: Repository<SOA>,
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

  async update(id: number, dto: UpdateBillingDto): Promise<Billing> {
    const billing = await this.findOne(id);
    Object.assign(billing, dto);

    billing.status = this.calculateStatus(billing);

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
      }
    }

    await this.billingRepo.save(billing);
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
}
