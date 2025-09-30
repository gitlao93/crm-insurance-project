import { Module } from '@nestjs/common';
import { PolicyPlanController } from './policy-plan.controller';
import { PolicyPlanService } from './policy-plan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyCategory } from 'src/policy-category/policy-category.entities';
import { PolicyPlan } from './policy-plan.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyCategory, PolicyPlan])],
  controllers: [PolicyPlanController],
  providers: [PolicyPlanService],
  exports: [PolicyPlanService],
})
export class PolicyPlanModule {}
