import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from 'src/agency/agency.entities';
import { User } from 'src/user/user.entities';
import { SeedService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, User])],
  providers: [SeedService],
})
export class SeedModule {}
