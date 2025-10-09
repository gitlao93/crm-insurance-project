import { forwardRef, Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from 'src/billing/billing.entities';
import { SOA } from 'src/soa/soa.entities';
import { Commission } from './commisson.entities';
import { User } from 'src/user/user.entities';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Billing, SOA, Commission, User]),
    forwardRef(() => BillingModule),
  ],
  providers: [CommissionService],
  controllers: [CommissionController],
  exports: [CommissionService],
})
export class CommissionModule {}
