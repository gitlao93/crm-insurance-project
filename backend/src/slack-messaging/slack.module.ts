import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { SlackGateway } from './slack.gateway';

import { User } from 'src/user/user.entities';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationGatewayModule } from 'src/notification-gateway/notification-gateway.module';
import { SlackChannel } from './entities/channel.entity';
import { SlackChannelMember } from './entities/channel-member.entity';
import { SlackMessage } from './entities/message.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SlackChannel,
      SlackChannelMember,
      SlackMessage,
      User,
    ]),
    NotificationModule, // ✅
    NotificationGatewayModule,
    AuthModule,
  ],
  controllers: [SlackController],
  providers: [SlackService, SlackGateway],
  exports: [SlackService],
})
export class SlackMessagingModule {}
