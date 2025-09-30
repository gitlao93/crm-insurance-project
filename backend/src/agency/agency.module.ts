import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from './agency.entities';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { User } from 'src/user/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, User])],
  controllers: [AgencyController],
  providers: [AgencyService],
  exports: [AgencyService],
})
export class AgencyModule {}
