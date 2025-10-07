import { Expose } from 'class-transformer';

export class PolicyHoldersByAgentDto {
  @Expose()
  agentId: number;

  @Expose()
  total: number;
}

export class PoliciesByMonthDto {
  @Expose()
  month: string;

  @Expose()
  count: number;
}

export class DashboardSummaryDto {
  @Expose()
  totalHolders: number;

  @Expose()
  totalAgents: number;

  @Expose()
  totalPlans: number;
}
