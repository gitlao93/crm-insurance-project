import { Module } from '@nestjs/common';
import { PolicyHolderService } from './policy-holder.service';
import {
  PolicyHolderController,
  PublicPolicyHolderController,
} from './policy-holder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyHolder } from './policy-holder.entities';
import { User } from 'src/user/user.entities';
import { SOA } from 'src/soa/soa.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { SoaModule } from 'src/soa/soa.module';
import { Billing } from 'src/billing/billing.entities';
import { Claim } from 'src/claim/claim.entities';
import { Quota } from 'src/quota/entities/quota.entity';
import { QuotaModule } from 'src/quota/quota.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PolicyHolder,
      User,
      SOA,
      PolicyPlan,
      Billing,
      Claim,
      Quota,
    ]),
    SoaModule,
    QuotaModule,
  ],
  providers: [PolicyHolderService],
  controllers: [PolicyHolderController, PublicPolicyHolderController],
})
export class PolicyHolderModule {}
