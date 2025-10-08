import { Module } from '@nestjs/common';
import { PolicyHolderService } from './policy-holder.service';
import { PolicyHolderController } from './policy-holder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyHolder } from './policy-holder.entities';
import { User } from 'src/user/user.entities';
import { SOA } from 'src/soa/soa.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { SoaModule } from 'src/soa/soa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyHolder, User, SOA, PolicyPlan]),
    SoaModule,
  ],
  providers: [PolicyHolderService],
  controllers: [PolicyHolderController],
})
export class PolicyHolderModule {}
