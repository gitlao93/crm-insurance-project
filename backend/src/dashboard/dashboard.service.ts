import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PolicyHolder,
  PolicyHolderStatus,
} from '../policy-holder/policy-holder.entities';
import { User, UserRole } from '../user/user.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { Lead, LeadStatus } from 'src/lead/lead.entities';
import { Claim } from 'src/claim/claim.entities';
import { Quota } from 'src/quota/entities/quota.entity';
import { AgentQuota } from 'src/quota/entities/agent-quota.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepo: Repository<PolicyHolder>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PolicyPlan)
    private policyPlanRepo: Repository<PolicyPlan>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Claim)
    private claimRepo: Repository<Claim>,
    @InjectRepository(Quota)
    private quotaRepo: Repository<Quota>,
    @InjectRepository(AgentQuota)
    private agentQuotaRepo: Repository<AgentQuota>,
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
  const data = await this.policyHolderRepo
    .createQueryBuilder('holder')
    .leftJoin('holder.agent', 'agent')
    .select([
      'agent.firstName AS agent_firstName',
      'agent.lastName AS agent_lastName',
    ])
    .addSelect('COUNT(holder.id)', 'totalPolicies')
    .groupBy('agent.id')
    .addGroupBy('agent.firstName')
    .addGroupBy('agent.lastName')
    .orderBy('totalPolicies', 'DESC')
    .limit(5)
    .getRawMany();

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

  /** 🔹 Sales Performance Report Table */
  async getSalesPerformance() {
    const agents = await this.userRepo.find({
      where: { role: UserRole.AGENT },
    });

    // Get current month and year
    const now = new Date();
    const month = now.getMonth() + 1; // 1–12
    const year = now.getFullYear();

    // ✅ safely find quota
    const quota = await this.quotaRepo.findOne({
      where: { month, year },
    });

    if (!quota) {
      // If no quota found, still return basic report
      return agents.map((agent, i) => ({
        agentId: agent.id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        policiesSold: 0,
        leadsConverted: 0,
        quotaPercentage: 0,
        rank: i + 1,
      }));
    }

    const report: {
      agentId: number;
      agentName: string;
      policiesSold: number;
      leadsConverted: number;
      quotaPercentage: number;
      rank?: number;
    }[] = [];

    for (const agent of agents) {
      const policiesSold = await this.policyHolderRepo.count({
        where: { agent: { id: agent.id } },
      });

      const leadsConverted = await this.leadRepo.count({
        where: { agent: { id: agent.id }, status: LeadStatus.CONVERTED },
      });

      const agentQuota = await this.agentQuotaRepo.findOne({
        where: { quota: { id: quota.id }, agent: { id: agent.id } },
      });

      const quotaPercentage = agentQuota?.achievementRate ?? 0;

      report.push({
        agentId: agent.id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        policiesSold,
        leadsConverted,
        quotaPercentage,
      });
    }

    // Sort by policies sold (or any metric you prefer)
    report.sort((a, b) => b.policiesSold - a.policiesSold);

    // Add ranking
    report.forEach((r, idx) => (r.rank = idx + 1));

    return report;
  }

  // src/dashboard/dashboard.service.ts
  async getCollectionSummary(
    supervisorId: number,
    startDate?: string,
    endDate?: string,
  ) {
    // 1. Get all agents under the supervisor
    const agents = await this.userRepo.find({
      where: { supervisorId, role: UserRole.AGENT },
    });

    if (agents.length === 0) {
      return { lapsable: 0, lapsed: 0, tcpPercent: 0, dapPercent: 0 };
    }

    const agentIds = agents.map((a) => a.id);

    // 2. Get all policyholders under those agents
    const policyholders = await this.policyHolderRepo.find({
      where: { agentId: In(agentIds) },
      relations: ['soa', 'soa.billings'],
    });

    if (policyholders.length === 0) {
      return { lapsable: 0, lapsed: 0, tcpPercent: 0, dapPercent: 0 };
    }

    // Initialize accumulators
    let totalAmountPaid = 0;
    let totalContractPrice = 0;
    const lapsableSet = new Set<number>();
    const lapsedSet = new Set<number>();

    const today = new Date();
    const lapsableThreshold = new Date();
    lapsableThreshold.setDate(today.getDate() + 5); // 5 days ahead

    // Determine default period for DAP%
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = endDate
      ? new Date(endDate)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let totalPaidInPeriod = 0;
    let totalDueInPeriod = 0;

    for (const holder of policyholders) {
      const billings = holder.soa?.billings || [];

      for (const b of billings) {
        const amount = Number(b.amount);
        const paid = Number(b.amountPaid);
        const dueDate = new Date(b.dueDate);

        totalAmountPaid += paid;
        totalContractPrice += amount;

        // LAPSABLE: due within next 5 days, unpaid
        if (paid < amount && dueDate >= today && dueDate <= lapsableThreshold) {
          lapsableSet.add(holder.id);
        }

        // LAPSED: due date passed, unpaid
        if (paid < amount && dueDate < today) {
          lapsedSet.add(holder.id);
        }

        // DAP%: payments and dues within the selected period
        if (dueDate >= periodStart && dueDate <= periodEnd) {
          totalPaidInPeriod += paid;
          totalDueInPeriod += amount;
        }
      }
    }

    // Calculate percentages
    const tcpPercent =
      totalContractPrice > 0 ? (totalAmountPaid / totalContractPrice) * 100 : 0;
    const dapPercent =
      totalDueInPeriod > 0 ? (totalPaidInPeriod / totalDueInPeriod) * 100 : 0;

    return {
      lapsable: lapsableSet.size,
      lapsed: lapsedSet.size,
      tcpPercent: Number(tcpPercent.toFixed(2)),
      dapPercent: Number(dapPercent.toFixed(2)),
    };
  }

  async getInstallmentRecoveryPercentage(
    supervisorId: number,
    startDate?: string,
    endDate?: string,
  ) {
    // Step 1: Get all agents under the supervisor
    const agents = await this.userRepo.find({
      where: { supervisorId },
    });

    if (agents.length === 0) {
      return { message: 'No agents found', irPercentage: 0 };
    }

    const agentIds = agents.map((a) => a.id);

    // Step 2: Get policyholders under those agents with LAPSABLE or LAPSED status
    const policyholders = await this.policyHolderRepo.find({
      where: {
        agentId: In(agentIds),
        status: In([PolicyHolderStatus.LAPSABLE, PolicyHolderStatus.LAPSED]),
      },
      relations: ['soa', 'soa.billings'],
    });

    let totalAmountDue = 0;
    let totalAmountPaid = 0;

    // Step 3: Loop through billings
    for (const ph of policyholders) {
      for (const billing of ph.soa?.billings || []) {
        // Optionally filter by date range
        if (
          startDate &&
          endDate &&
          (billing.dueDate < new Date(startDate) ||
            billing.dueDate > new Date(endDate))
        ) {
          continue;
        }

        totalAmountDue += Number(billing.amount);
        totalAmountPaid += Number(billing.amountPaid);
      }
    }

    // Step 4: Compute IR%
    const irPercentage =
      totalAmountDue > 0 ? (totalAmountPaid / totalAmountDue) * 100 : 0;

    return {
      irPercentage: Number(irPercentage.toFixed(2)),
      totalAmountPaid,
      totalAmountDue,
    };
  }

  async getCollectionsPerAgent(supervisorId: number) {
    // Get all agents under this supervisor
    const agents = await this.userRepo.find({
      where: { supervisorId, role: UserRole.AGENT },
    });

    if (agents.length === 0) return [];

    const agentIds = agents.map((a) => a.id);

    // Fetch all policyholders and their SOA billings for these agents
    const policyholders = await this.policyHolderRepo.find({
      where: { agentId: In(agentIds) },
      relations: ['soa', 'soa.billings'],
    });

    const collectionsMap: Record<number, number> = {};

    for (const holder of policyholders) {
      const agentId = holder.agentId;
      const billings = holder.soa?.billings || [];

      let totalPaid = 0;
      for (const b of billings) {
        totalPaid += Number(b.amountPaid) || 0;
      }

      collectionsMap[agentId] = (collectionsMap[agentId] || 0) + totalPaid;
    }

    // Format for frontend chart
    return agents.map((agent) => ({
      agentId: agent.id,
      name: `${agent.firstName} ${agent.lastName}`,
      totalCollection: Number(collectionsMap[agent.id] || 0),
    }));
  }

  /** 🔹 Pie Chart: Lapsed vs Active Policies */
  async getPolicyStatusDistribution(supervisorId: number) {
    const agents = await this.userRepo.find({
      where: { supervisorId, role: UserRole.AGENT },
    });
    if (agents.length === 0) return [];

    const agentIds = agents.map((a) => a.id);

    const totalActive = await this.policyHolderRepo.count({
      where: { agentId: In(agentIds), status: PolicyHolderStatus.ACTIVE },
    });

    const totalLapsed = await this.policyHolderRepo.count({
      where: { agentId: In(agentIds), status: PolicyHolderStatus.LAPSED },
    });

    return [
      { name: 'Active', value: totalActive },
      { name: 'Lapsed', value: totalLapsed },
    ];
  }

  /** 🔹 Line Chart: Monthly Collection Trend */
  async getMonthlyCollectionTrend(supervisorId: number) {
    const agents = await this.userRepo.find({
      where: { supervisorId, role: UserRole.AGENT },
    });
    if (agents.length === 0) return [];

    const agentIds = agents.map((a) => a.id);

    // Group collections by month (using TypeORM query builder)
    const data = await this.policyHolderRepo
      .createQueryBuilder('holder')
      .leftJoin('holder.soa', 'soa')
      .leftJoin('soa.billings', 'billing')
      .select("DATE_FORMAT(billing.dueDate, '%Y-%m')", 'month')
      .addSelect('SUM(billing.amountPaid)', 'totalPaid')
      .where('holder.agentId IN (:...agentIds)', { agentIds })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; totalPaid: string }>();

    return data.map((d) => ({
      month: d.month,
      total: Number(d.totalPaid || 0),
    }));
  }
}
