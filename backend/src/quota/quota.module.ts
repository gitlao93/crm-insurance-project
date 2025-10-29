import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { QuotaController } from './quota.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quota } from './entities/quota.entity';
import { AgentQuota } from './entities/agent-quota.entity';
import { User } from 'src/user/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Quota, AgentQuota, User])],
  providers: [QuotaService],
  controllers: [QuotaController],
  exports: [QuotaService],
})
export class QuotaModule {}
