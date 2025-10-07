import { Controller, Get, UseGuards } from '@nestjs/common';
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

  // ✅ Policy holders created per month (this year)
  @Get('policies-by-month')
  async getPoliciesByMonth() {
    return this.dashboardService.getPoliciesByMonth();
  }

  // ✅ Summary counts (useful for dashboard cards)
  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }
}
