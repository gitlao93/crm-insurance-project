import { Module } from '@nestjs/common';
import { LeadInteractionController } from './lead-interaction.controller';
import { LeadInteractionService } from './lead-interaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadInteraction } from './lead-interaction.entities';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationGatewayModule } from 'src/notification-gateway/notification-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadInteraction]),
    NotificationModule,
    NotificationGatewayModule,
  ],
  controllers: [LeadInteractionController],
  providers: [LeadInteractionService],
  exports: [LeadInteractionService],
})
export class LeadInteractionModule {}
