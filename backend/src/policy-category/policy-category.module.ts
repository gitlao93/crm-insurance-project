import { Module } from '@nestjs/common';
import { PolicyCategoryController } from './policy-category.controller';
import { PolicyCategoryService } from './policy-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyCategory } from './policy-category.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { Agency } from 'src/agency/agency.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyCategory, PolicyPlan, Agency])],
  controllers: [PolicyCategoryController],
  providers: [PolicyCategoryService],
  exports: [PolicyCategoryService],
})
export class PolicyCategoryModule {}
