import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PolicyDependentService } from './policy-dependent.service';
import { CreatePolicyDependentDto } from './dto/create-policy-dependent.dto';
import { UpdatePolicyDependentDto } from './dto/update-policy-dependent.dto';

@Controller('policy-dependents')
export class PolicyDependentController {
  constructor(private readonly dependentService: PolicyDependentService) {}

  @Post()
  create(@Body() dto: CreatePolicyDependentDto) {
    return this.dependentService.create(dto);
  }

  @Get()
  findAll() {
    return this.dependentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.dependentService.findOne(id);
  }

  @Get('holder/:holderId')
  findByPolicyHolder(@Param('holderId') holderId: number) {
    return this.dependentService.findByPolicyHolder(holderId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePolicyDependentDto) {
    return this.dependentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.dependentService.remove(id);
  }
}
