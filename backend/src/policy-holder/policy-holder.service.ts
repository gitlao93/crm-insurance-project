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
import { Billing } from 'src/billing/billing.entities';
import { addMonths, addYears } from 'date-fns';

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
  ) {}

  async create(dto: CreatePolicyHolderDto): Promise<PolicyHolder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Create PolicyHolder inside transaction
      const holder = queryRunner.manager.create(PolicyHolder, dto);
      await queryRunner.manager.save(holder);

      // 2️⃣ Fetch Policy Plan
      const plan = await this.planRepository.findOne({
        where: { id: dto.policyPlanId },
      });
      if (!plan) throw new NotFoundException('Policy Plan not found');
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

      // 3️⃣ Prepare SOA data
      const startDate = new Date(dto.StartDate).toISOString();
      const endDate = new Date(dto.EndDate).toISOString();

      const paymentTerm = plan.term;
      const premiumPerTerm = plan.premium;
      const duration = plan.duration;
      const totalPremium = premiumPerTerm * totalInstallments;
      const policyNumber = `POL-${holder.id}-${Date.now()}`;

      // 4️⃣ Create SOA (without billings)
      const soa = queryRunner.manager.create(SOA, {
        policyHolderId: holder.id,
        policyPlanId: dto.policyPlanId,
        startDate,
        endDate,
        paymentTerm,
        premiumPerTerm,
        duration,
        totalPremium,
        status: 'Active',
        policyNumber,
        totalPaid: 0,
        balance: totalPremium,
      });
      await queryRunner.manager.save(soa);

      // 5️⃣ Create Billing Schedule here
      const billings: Billing[] = [];
      for (let i = 0; i < totalInstallments; i++) {
        let dueDate: Date;

        switch (plan.term) {
          case PolicyTerm.ANNUALLY:
            dueDate = addYears(new Date(startDate), i);
            break;

          case PolicyTerm.QUARTERLY:
            dueDate = addMonths(new Date(startDate), i * 3);
            break;

          case PolicyTerm.MONTHLY: // Monthly
            dueDate = addMonths(new Date(startDate), i);
        }

        billings.push(
          queryRunner.manager.create(Billing, {
            soaId: soa.id,
            installmentNumber: i + 1,
            amount: premiumPerTerm,
            dueDate,
          }),
        );
      }

      await queryRunner.manager.save(billings);

      // 6️⃣ Commit transaction
      await queryRunner.commitTransaction();

      const createdHolder = await this.policyHolderRepository.findOne({
        where: { id: holder.id },
        relations: ['policyPlan', 'soa', 'soa.billings'],
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
        relations: ['agent', 'policyPlan'],
      });
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && user.role === UserRole.AGENT) {
      return this.policyHolderRepository.find({
        where: { agentId: userId },
        relations: ['agent', 'policyPlan'],
      });
    }

    if (user && user.role === UserRole.ADMIN) {
      return this.policyHolderRepository.find({
        where: { agencyId: user.agencyId },
        relations: ['agent', 'policyPlan'],
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

  async remove(id: number): Promise<void> {
    const result = await this.policyHolderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }
}
