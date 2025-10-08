import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoaService } from './soa.service';
import { SoaController } from './soa.controller';
import { SOA } from './soa.entities';
import { Billing } from 'src/billing/billing.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([SOA, Billing, PolicyPlan]), // ✅ repositories
  ],
  controllers: [SoaController],
  providers: [SoaService],
  exports: [SoaService], // ✅ allows other modules to use it
})
export class SoaModule {}
