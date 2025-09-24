import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PolicyCategoryService } from './policy-category.service';
import { CreatePolicyCategoryDto } from './dto/create-policy-category.dto';
import { UpdatePolicyCategoryDto } from './dto/update-policy-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('policy-categories')
export class PolicyCategoryController {
  constructor(private readonly categoryService: PolicyCategoryService) {}

  @Post()
  async create(@Body() dto: CreatePolicyCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  async findAll(@Query('agencyId') agencyId?: number) {
    if (agencyId) return this.categoryService.findAll(agencyId);
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePolicyCategoryDto) {
    return this.categoryService.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
