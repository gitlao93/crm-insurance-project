import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { PolicyPlanService } from './policy-plan.service';
import { CreatePolicyPlanDto } from './dto/create-policy-plan.dto';
import { UpdatePolicyPlanDto } from './dto/update-policy-plan.dto';

@Controller('policy-plans')
export class PolicyPlanController {
  constructor(private readonly planService: PolicyPlanService) {}

  @Post()
  async create(@Body() dto: CreatePolicyPlanDto) {
    return this.planService.create(dto);
  }

  @Get()
  async findAll(@Query('categoryId') categoryId: number) {
    if (categoryId) return this.planService.findAll(categoryId);
    return this.planService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.planService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePolicyPlanDto) {
    return this.planService.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.planService.remove(+id);
  }
}
