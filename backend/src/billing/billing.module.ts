import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { SOA } from 'src/soa/soa.entities';
import { Billing } from './billing.entities';
import { Commission } from 'src/comission/commisson.entities';
import { CommissionModule } from 'src/comission/commission.module';
import { User } from 'src/user/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Billing, SOA, Commission, User]),
    forwardRef(() => CommissionModule),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
