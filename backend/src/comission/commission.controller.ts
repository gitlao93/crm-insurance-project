// src/comission/commission.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CommissionService } from './commission.service';
import { Commission } from './commisson.entities';

@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  // ✅ GET /commissions → get all commissions
  @Get()
  async findAll(): Promise<Commission[]> {
    return this.commissionService.findAll();
  }

  // ✅ GET /commissions/agent/:agentId → get all commissions by agent
  @Get('agent/:agentId')
  async findByAgent(
    @Param('agentId', ParseIntPipe) agentId: number,
  ): Promise<Commission[]> {
    return this.commissionService.findByAgent(agentId);
  }

  // ✅ POST /commissions/create/:billingId → manually trigger commission creation
  @Post('create/:billingId')
  async createCommission(
    @Param('billingId', ParseIntPipe) billingId: number,
  ): Promise<Commission> {
    const result =
      await this.commissionService.createCommissionForBilling(billingId);
    if (!result) {
      throw new NotFoundException('Commission creation failed');
    }
    return result;
  }
}
