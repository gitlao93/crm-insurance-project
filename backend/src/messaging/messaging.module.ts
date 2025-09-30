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

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember, Message, MessageStatus]),
  ],
  controllers: [
    ChannelsController,
    MessagesController,
    ChannelMembersController,
    MessageStatusesController,
  ],
  providers: [
    ChannelsService,
    MessagesService,
    ChannelMembersService,
    MessageStatusService,
  ],
  exports: [
    ChannelsService,
    MessagesService,
    ChannelMembersService,
    MessageStatusService,
  ],
})
export class MessagingModule {}
