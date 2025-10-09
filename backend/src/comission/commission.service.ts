import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from 'src/billing/billing.entities';
import { Commission } from './commisson.entities';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
    @InjectRepository(Billing)
    private billingRepo: Repository<Billing>,
  ) {}

  async createCommissionForBilling(billingId: number) {
    // 0) Prevent duplicate commission for same billing
    const existing = await this.commissionRepo.findOne({
      where: { billingId },
    });
    if (existing) return existing;

    // 1) Load billing with relations (fresh from DB)
    const billing = await this.billingRepo.findOne({
      where: { id: billingId },
      relations: [
        'soa',
        'soa.policyPlan',
        'soa.policyHolder',
        'soa.policyHolder.agent',
      ],
    });

    if (!billing) throw new NotFoundException('Billing not found');

    const plan = billing.soa.policyPlan;
    const holder = billing.soa.policyHolder;
    const agent = holder.agent;

    const commissionAmount =
      Number(billing.amountPaid) * (Number(plan.commission_rate) / 100);

    const commission = this.commissionRepo.create({
      billingId: billing.id,
      soaId: billing.soa.id,
      policyPlanId: plan.id,
      policyHolderId: holder.id,
      agentId: agent.id,
      amount: commissionAmount,
      paid: false,
    });

    return this.commissionRepo.save(commission);
  }

  findAll() {
    return this.commissionRepo.find({
      relations: ['agent', 'policyHolder', 'policyPlan', 'billing', 'user'],
    });
  }

  findByAgent(agentId: number) {
    return this.commissionRepo.find({
      where: { agentId },
      relations: ['policyHolder', 'policyPlan', 'billing', 'user'],
    });
  }
}
