import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelMember } from './entities/channel-member.entity';
import { Message } from './entities/message.entity';
import { MessageStatus } from './entities/message-status.entity';

import { ChannelMembersController } from './controller/channel-members.controller';
import { ChannelMembersService } from './service/channel-members.service';
import { ChannelsController } from './controller/channels.controller';
import { MessagesController } from './controller/messages.controller';
import { ChannelsService } from './service/channels.service';
import { MessagesService } from './service/messages.service';
import { MessageStatusService } from './service/message-status.service';
import { MessageStatusesController } from './controller/message-status.controller';
import { DirectMessageService } from './service/direct-message.service';
import { DirectMessageController } from './controller/direct-message.controller';
import { DirectMessage } from './entities/direct-message.entity';
import { User } from 'src/user/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChannelMember,
      Message,
      MessageStatus,
      DirectMessage,
      User,
    ]),
  ],
  controllers: [
    ChannelsController,
    MessagesController,
    ChannelMembersController,
    MessageStatusesController,
    DirectMessageController,
  ],
  providers: [
    ChannelsService,
    MessagesService,
    ChannelMembersService,
    MessageStatusService,
    DirectMessageService,
  ],
  exports: [
    ChannelsService,
    MessagesService,
    ChannelMembersService,
    MessageStatusService,
    DirectMessageService,
  ],
})
export class MessagingModule {}
