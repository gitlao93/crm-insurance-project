import { Module } from '@nestjs/common';
import { LeadInteractionController } from './lead-interaction.controller';
import { LeadInteractionService } from './lead-interaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadInteraction } from './lead-interaction.entities';

@Module({
  imports: [TypeOrmModule.forFeature([LeadInteraction])],
  controllers: [LeadInteractionController],
  providers: [LeadInteractionService],
  exports: [LeadInteractionService],
})
export class LeadInteractionModule {}
