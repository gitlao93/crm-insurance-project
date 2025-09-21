import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from 'src/agency/agency.entities';
import { User } from './user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
