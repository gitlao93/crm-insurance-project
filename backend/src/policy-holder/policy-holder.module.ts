import { Module } from '@nestjs/common';
import { PolicyHolderService } from './policy-holder.service';
import { PolicyHolderController } from './policy-holder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyHolder } from './policy-holder.entities';
import { User } from 'src/user/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyHolder, User])],
  providers: [PolicyHolderService],
  controllers: [PolicyHolderController],
})
export class PolicyHolderModule {}
