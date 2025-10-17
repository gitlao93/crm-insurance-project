import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from 'src/agency/agency.entities';
import { User } from './user.entities';
import { Quota } from 'src/quota/entities/quota.entity';
import { AgentQuota } from 'src/quota/entities/agent-quota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, User, Quota, AgentQuota])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
