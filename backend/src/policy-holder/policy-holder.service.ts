import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/user/user.entities';
import { DataSource, Repository } from 'typeorm';
import { PolicyHolder } from './policy-holder.entities';
import { CreatePolicyHolderDto } from './dto/create-policy-holder.dto';
import { UpdatePolicyHolderDto } from './dto/update-policy-holder.dto';

import { PolicyPlan, PolicyTerm } from 'src/policy-plan/policy-plan.entities';
import { SoaService } from 'src/soa/soa.service';
import { SOA } from 'src/soa/soa.entities';
import { Billing, BillingStatus } from 'src/billing/billing.entities';
import { addMonths, addYears } from 'date-fns';
import { Commission } from 'src/comission/commisson.entities';
import { QuotaService } from 'src/quota/quota.service';

@Injectable()
export class PolicyHolderService {
  constructor(
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PolicyPlan)
    private readonly planRepository: Repository<PolicyPlan>,

    private readonly soaService: SoaService,

    private readonly dataSource: DataSource,

    private readonly quotaService: QuotaService,
  ) {}

  async create(
    dto: CreatePolicyHolderDto,
    receiptNumber?: string,
  ): Promise<PolicyHolder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Create PolicyHolder
      const holder = queryRunner.manager.create(PolicyHolder, dto);
      await queryRunner.manager.save(holder);

      // 2️⃣ Fetch Policy Plan
      const plan = await this.planRepository.findOne({
        where: { id: dto.policyPlanId },
      });
      if (!plan) throw new NotFoundException('Policy Plan not found');

      // Calculate total installments
      let totalInstallments = 0;
      switch (plan.term) {
        case PolicyTerm.MONTHLY:
          totalInstallments = plan.duration * 12;
          break;
        case PolicyTerm.QUARTERLY:
          totalInstallments = plan.duration * 4;
          break;
        case PolicyTerm.ANNUALLY:
          totalInstallments = plan.duration;
          break;
      }

      // 3️⃣ Prepare SOA
      const startDate = new Date(dto.StartDate);
      const endDate = new Date(dto.EndDate);
      const totalPremium = plan.premium * totalInstallments;
      const policyNumber = `POL-${holder.id}-${Date.now()}`;

      const soa = queryRunner.manager.create(SOA, {
        policyHolderId: holder.id,
        policyPlanId: plan.id,
        startDate,
        endDate,
        paymentTerm: plan.term,
        premiumPerTerm: plan.premium,
        duration: plan.duration,
        totalPremium,
        totalPaid: 0,
        balance: totalPremium,
        status: 'Active',
        policyNumber,
      });
      await queryRunner.manager.save(soa);

      // 4️⃣ Create First Billing (paid immediately)
      const firstBilling = queryRunner.manager.create(Billing, {
        soaId: soa.id,
        installmentNumber: 1,
        amount: plan.premium,
        amountPaid: plan.premium,
        dueDate: startDate,
        status: BillingStatus.PAID,
        receiptNumber: receiptNumber,
        paidDate: new Date(),
      });
      await queryRunner.manager.save(firstBilling);

      // Update SOA with first payment
      soa.totalPaid = plan.premium;
      soa.balance = totalPremium - plan.premium;
      await queryRunner.manager.save(soa);

      // 5️⃣ Create Commission for first payment
      if (holder.agentId && plan.commission_rate > 0) {
        const commissionAmount = (plan.commission_rate / 100) * plan.premium;

        const commission = queryRunner.manager.create(Commission, {
          billing: firstBilling,
          soa,
          policyPlan: plan,
          policyHolder: holder,
          agentId: holder.agentId,
          amount: commissionAmount,
          paid: false,
        });

        await queryRunner.manager.save(commission);
      }

      // 6️⃣ Create remaining billings (pending)
      const billings: Billing[] = [];
      for (let i = 1; i < totalInstallments; i++) {
        let dueDate: Date;
        switch (plan.term) {
          case PolicyTerm.ANNUALLY:
            dueDate = addYears(startDate, i);
            break;
          case PolicyTerm.QUARTERLY:
            dueDate = addMonths(startDate, i * 3);
            break;
          case PolicyTerm.MONTHLY:
          default:
            dueDate = addMonths(startDate, i);
            break;
        }

        const billing = queryRunner.manager.create(Billing, {
          soaId: soa.id,
          installmentNumber: i + 1,
          amount: plan.premium,
          amountPaid: 0,
          dueDate,
          status: BillingStatus.PENDING,
        });

        billings.push(billing);
      }

      await queryRunner.manager.save(billings);

      // 7️⃣ Commit transaction
      await queryRunner.commitTransaction();

      if (dto.agentId) {
        console.log('Updating quota for agent:', dto.agentId);
        try {
          await this.quotaService.updateAgentPerformance(dto.agentId);
        } catch (quotaError) {
          console.warn('⚠️ Failed to update agent quota:', quotaError);
        }
      }

      // 8️⃣ Return created holder with relations
      const createdHolder = await this.policyHolderRepository.findOne({
        where: { id: holder.id },
        relations: ['policyPlan', 'soa', 'soa.billings', 'agent'],
      });

      if (!createdHolder)
        throw new NotFoundException('Created PolicyHolder not found');

      return createdHolder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Transaction failed:', error);
      throw new BadRequestException(error || 'Error creating policy');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: number) {
    if (!userId) {
      console.log('Fetching all leads without user filter');
      return this.policyHolderRepository.find({
        relations: [
          'agent',
          'policyPlan',
          'policyPlan.category',
          'soa',
          'soa.billings',
        ],
      });
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && user.role === UserRole.AGENT) {
      return this.policyHolderRepository.find({
        where: { agentId: userId },
        relations: [
          'agent',
          'policyPlan',
          'policyPlan.category',
          'soa',
          'soa.billings',
        ],
      });
    }

    if (user && user.role === UserRole.ADMIN) {
      return this.policyHolderRepository.find({
        where: { agencyId: user.agencyId },
        relations: [
          'agent',
          'policyPlan',
          'policyPlan.category',
          'soa',
          'soa.billings',
        ],
      });
    }
  }

  async findOne(id: number): Promise<PolicyHolder> {
    const lead = await this.policyHolderRepository.findOne({
      where: { id },
      relations: ['agent', 'policyPlan', 'policyPlan.category'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: number, dto: UpdatePolicyHolderDto): Promise<PolicyHolder> {
    await this.policyHolderRepository.update(id, dto);
    return this.findOne(id);
  }

  async findByPolicyNumber(policyNumber: string): Promise<PolicyHolder> {
    const holder = await this.policyHolderRepository.findOne({
      where: { policyNumber },
      relations: ['agent', 'policyPlan', 'policyPlan.category'],
    });

    if (!holder) {
      throw new NotFoundException(
        `PolicyHolder with policy number ${policyNumber} not found`,
      );
    }

    return holder;
  }

  async remove(id: number): Promise<void> {
    const result = await this.policyHolderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }
}
