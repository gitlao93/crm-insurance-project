import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { SOA } from 'src/soa/soa.entities';
import { Billing } from './billing.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Billing, SOA])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
