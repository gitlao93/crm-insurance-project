import { Module } from '@nestjs/common';
import { ClaimService } from './claim.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './claim.entities';
import { ClaimController } from './claim.controller';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { User } from 'src/user/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, PolicyHolder, User])],
  providers: [ClaimService],
  controllers: [ClaimController],
})
export class ClaimModule {}
