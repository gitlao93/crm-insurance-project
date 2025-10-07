import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PolicyHolder } from '../policy-holder/policy-holder.entities';
import { User } from '../user/user.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyHolder, PolicyPlan, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
