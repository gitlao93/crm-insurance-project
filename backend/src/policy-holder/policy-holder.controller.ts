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
import { PolicyHolderService } from './policy-holder.service';
import { CreatePolicyHolderDto } from './dto/create-policy-holder.dto';
import { UpdatePolicyHolderDto } from './dto/update-policy-holder.dto';
import { PolicyHolder } from './policy-holder.entities';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('policy-holders')
export class PolicyHolderController {
  constructor(private readonly policyHolderService: PolicyHolderService) {}

  // ✅ Create a new Policy Holder
  @Post()
  async create(
    @Body() body: CreatePolicyHolderDto & { receiptNumber?: string },
  ): Promise<PolicyHolder> {
    const { receiptNumber, ...dto } = body;
    if (receiptNumber)
      return this.policyHolderService.create(dto, receiptNumber);
    else return this.policyHolderService.create(dto);
  }

  // ✅ Get all Policy Holders (optionally filtered by userId)
  @Get()
  async findAll(@Query('userId') userId?: number) {
    if (userId) return this.policyHolderService.findAll(Number(userId));
    return this.policyHolderService.findAll();
  }

  // ✅ Get a single Policy Holder by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PolicyHolder> {
    return this.policyHolderService.findOne(id);
  }

  // ✅ Update a Policy Holder by ID
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePolicyHolderDto,
  ): Promise<PolicyHolder> {
    return this.policyHolderService.update(id, dto);
  }

  // ✅ Delete a Policy Holder by ID
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.policyHolderService.remove(id);
  }
}
