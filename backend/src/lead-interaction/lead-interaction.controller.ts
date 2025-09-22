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
} from '@nestjs/common';
import { LeadInteractionService } from './lead-interaction.service';
import { CreateLeadInteractionDto } from './dto/create-lead-interaction.dto';
import { UpdateLeadInteractionDto } from './dto/update-lead-interaction.dto';
import { LeadInteraction } from './lead-interaction.entities';

@Controller('lead-interactions')
export class LeadInteractionController {
  constructor(
    private readonly leadInteractionService: LeadInteractionService,
  ) {}

  // ✅ Create a new lead interaction
  @Post()
  async create(
    @Body() dto: CreateLeadInteractionDto,
  ): Promise<LeadInteraction> {
    return this.leadInteractionService.create(dto);
  }

  // ✅ Get all interactions for a lead
  @Get()
  async findAll(@Query('leadId') leadId: number): Promise<LeadInteraction[]> {
    return this.leadInteractionService.findAll(leadId);
  }

  // ✅ Get a single interaction by ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LeadInteraction> {
    return this.leadInteractionService.findOne(id);
  }

  // ✅ Update an interaction
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadInteractionDto,
  ): Promise<LeadInteraction> {
    return this.leadInteractionService.update(id, dto);
  }

  // ✅ Delete an interaction
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadInteractionService.remove(id);
  }
}
