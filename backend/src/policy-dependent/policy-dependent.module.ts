import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyDependentService } from './policy-dependent.service';
import { PolicyDependentController } from './policy-dependent.controller';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { PolicyDependent } from './policy-dependent.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyDependent, PolicyHolder])],
  controllers: [PolicyDependentController],
  providers: [PolicyDependentService],
  exports: [PolicyDependentService],
})
export class PolicyDependentModule {}
