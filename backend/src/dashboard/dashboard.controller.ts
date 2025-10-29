import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ✅ Total policy holders grouped by agent
  @Get('policyholders-by-agent')
  async getPolicyHoldersByAgent() {
    return this.dashboardService.getPolicyHoldersByAgent();
  }

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('charts/collections-per-agent')
  getCollectionsPerAgent(@Query('supervisorId') supervisorId: number) {
    return this.dashboardService.getCollectionsPerAgent(supervisorId);
  }

  @Get('charts/policy-status')
  getPolicyStatus(@Query('supervisorId') supervisorId: number) {
    return this.dashboardService.getPolicyStatusDistribution(supervisorId);
  }

  @Get('charts/monthly-collection-trend')
  getMonthlyTrend(@Query('supervisorId') supervisorId: number) {
    return this.dashboardService.getMonthlyCollectionTrend(supervisorId);
  }

  /** 🔹 Monthly Sales Trend (Policies Sold per Month) */
  @Get('sales-trend')
  async getSalesTrend() {
    return this.dashboardService.getSalesTrend();
  }

  /** 🔹 Top Performing Agents */
  @Get('top-agents')
  async getTopAgents() {
    return this.dashboardService.getTopAgents();
  }

  /** 🔹 Lead Conversion Data */
  @Get('lead-conversion')
  async getLeadConversion() {
    return this.dashboardService.getLeadConversion();
  }

  /** 🔹 Sales Performance Report Table */
  @Get('sales-performance')
  async getSalesPerformance() {
    return this.dashboardService.getSalesPerformance();
  }

  @Get('collection-summary')
  getCollectionSummary(
    @Query('supervisorId') supervisorId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getCollectionSummary(
      supervisorId,
      startDate,
      endDate,
    );
  }

  @Get('collection-ir-percentage')
  async getInstallmentRecovery(
    @Query('supervisorId') supervisorId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getInstallmentRecoveryPercentage(
      supervisorId,
      startDate,
      endDate,
    );
  }
}
