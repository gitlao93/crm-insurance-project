import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './lead.entities';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  // ✅ Create a new lead
  @Post()
  async create(@Body() dto: CreateLeadDto): Promise<Lead> {
    return this.leadService.create(dto);
  }

  // ✅ Get all leads, optionally filtered by userId (agent)
  @Get()
  async findAll(@Query('userId') userId?: number) {
    if (userId) return this.leadService.findAll(userId);
    return this.leadService.findAll();
  }

  // ✅ Get a single lead by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Lead> {
    return this.leadService.findOne(id);
  }

  // ✅ Update a lead by ID
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.leadService.update(id, dto);
  }

  // ✅ Drop a lead by ID (set status to DROPPED)
  @Patch('drop/:id')
  async drop(@Param('id', ParseIntPipe) id: number): Promise<Lead> {
    return this.leadService.dropLead(id);
  }

  // ✅ Delete a lead by ID
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadService.remove(id);
  }
}
