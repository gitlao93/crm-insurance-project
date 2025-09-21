import { Module } from '@nestjs/common';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entities';
import { User } from 'src/user/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, User])],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
