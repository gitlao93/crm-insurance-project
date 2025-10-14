import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyHolder } from '../policy-holder/policy-holder.entities';
import { User, UserRole } from '../user/user.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { Lead, LeadStatus } from 'src/lead/lead.entities';
import { Claim } from 'src/claim/claim.entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepo: Repository<PolicyHolder>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PolicyPlan)
    private policyPlanRepo: Repository<PolicyPlan>,
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(Claim) private claimRepo: Repository<Claim>,
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

  // ✅ 2. Dashboard summary (total policyholders, agents, plans)
  async getSummary() {
    // Count all Policy Holders
    const totalHolders = await this.policyHolderRepo.count();

    // Count all Agents
    const totalAgents = await this.userRepo.count({
      where: { role: UserRole.AGENT },
    });

    // Count all Policy Plans
    const totalPlans = await this.policyPlanRepo.count();

    // ✅ Count all Leads Registered
    const totalLeads = await this.leadRepo.count();

    // ✅ Count all Claims Filed
    const totalClaims = await this.claimRepo.count();

    // Return combined summary
    return {
      totalHolders,
      totalAgents,
      totalPlans,
      totalLeads,
      totalClaims,
    };
  }

  /** 🔹 Monthly Sales Trend */
  async getSalesTrend() {
    interface SalesTrendRow {
      month: string;
      count: string;
    }

    const data = await this.policyHolderRepo
      .createQueryBuilder('holder')
      .select("DATE_FORMAT(holder.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(holder.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<SalesTrendRow>();

    return data.map((item) => ({
      month: item.month,
      total: Number(item.count),
    }));
  }

  /** 🔹 Top Performing Agents */
  async getTopAgents() {
    interface TopAgentRow {
      agent_firstName: string;
      agent_lastName: string;
      totalPolicies: string;
    }

    const data = await this.policyHolderRepo
      .createQueryBuilder('holder')
      .leftJoin('holder.agent', 'agent')
      .select([
        'agent.firstName AS agent_firstName',
        'agent.lastName AS agent_lastName',
      ])
      .addSelect('COUNT(holder.id)', 'totalPolicies')
      .groupBy('agent.id')
      .orderBy('totalPolicies', 'DESC')
      .limit(5)
      .getRawMany<TopAgentRow>();

    return data.map((agent) => ({
      name: `${agent.agent_firstName} ${agent.agent_lastName}`,
      totalPolicies: Number(agent.totalPolicies),
    }));
  }

  /** 🔹 Lead Conversion Rate */
  async getLeadConversion() {
    const total = await this.leadRepo.count();

    const newLeads = await this.leadRepo.count({
      where: { status: LeadStatus.NEW },
    });
    const inProgress = await this.leadRepo.count({
      where: { status: LeadStatus.IN_PROGRESS },
    });
    const converted = await this.leadRepo.count({
      where: { status: LeadStatus.CONVERTED },
    });
    const dropped = await this.leadRepo.count({
      where: { status: LeadStatus.DROPPED },
    });

    return {
      total,
      data: [
        { name: 'New', value: newLeads },
        { name: 'In Progress', value: inProgress },
        { name: 'Converted', value: converted },
        { name: 'Dropped', value: dropped },
      ],
    };
  }
}
