import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyHolder } from '../policy-holder/policy-holder.entities';
import { User, UserRole } from '../user/user.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepo: Repository<PolicyHolder>,
    @InjectRepository(PolicyPlan)
    private readonly policyPlanRepo: Repository<PolicyPlan>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ✅ 1. Number of PolicyHolders grouped by Agent
  async getPolicyHoldersByAgent() {
    return this.policyHolderRepo
      .createQueryBuilder('ph')
      .select('ph.agentId', 'agentId')
      .addSelect('ph.firstName', 'firstName') // alias firstName
      .addSelect('ph.lastName', 'lastName')
      .addSelect('COUNT(ph.id)', 'total')
      .groupBy('ph.agentId')
      .getRawMany();
  }

  // ✅ 2. Policies created per month (for current year)
  async getPoliciesByMonth() {
    const currentYear = new Date().getFullYear();
    const result = await this.policyHolderRepo
      .createQueryBuilder('ph')
      .select("TO_CHAR(ph.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(ph.id)', 'count')
      .where('EXTRACT(YEAR FROM ph.createdAt) = :year', { year: currentYear })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  // ✅ 3. Dashboard summary (total policyholders, agents, plans)
  async getSummary() {
    const totalHolders = await this.policyHolderRepo.count();
    const totalAgents = await this.userRepo.count({
      where: { role: UserRole.AGENT },
    });
    const totalPlans = await this.policyPlanRepo.count();

    return {
      totalHolders,
      totalAgents,
      totalPlans,
    };
  }
}
