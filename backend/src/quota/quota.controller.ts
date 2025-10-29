import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuotaService } from './quota.service';
import { CreateQuotaDto } from './dto/create-quota.dto';
import { UpdateQuotaDto } from './dto/update-quota.dto';
import { UpdateAgentQuotaDto } from './dto/update-agent-quota.dto';

@Controller('quotas')
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Post()
  create(@Body() dto: CreateQuotaDto) {
    const { adminId, ...quotaData } = dto;
    return this.quotaService.create(quotaData, adminId);
  }

  @Get()
  findAll() {
    return this.quotaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.quotaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateQuotaDto) {
    const updatedBy = 1; // Replace with actual logged-in admin ID
    return this.quotaService.update(id, dto, updatedBy);
  }

  @Patch('agent/:id')
  updateAgentQuota(@Param('id') id: number, @Body() dto: UpdateAgentQuotaDto) {
    return this.quotaService.updateAgentQuota(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.quotaService.remove(id);
  }
}
