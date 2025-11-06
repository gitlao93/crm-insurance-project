import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import {
  CreateMessageDto,
  MessageResponseDto,
  UpdateMessageDto,
} from '../dto/message.dto';
import { plainToInstance } from 'class-transformer';
import { ChannelMember } from '../entities/channel-member.entity';
import { NotificationsService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(ChannelMember)
    private readonly memberRepo: Repository<ChannelMember>,

    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    dto: CreateMessageDto & { channelId: number },
  ): Promise<MessageResponseDto> {
    const message = this.messageRepo.create(dto);
    const saved = await this.messageRepo.save(message);

    // reload with relations
    const fullMessage = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'channel'],
    });

    if (!fullMessage) {
      throw new Error('Message not found after save');
    }

    // ✅ Notify all other channel members
    const members = await this.memberRepo.find({
      where: { channelId: dto.channelId },
      relations: ['user'],
    });

    for (const member of members) {
      if (member.userId === dto.senderId) continue; // skip sender

      const notification = await this.notificationsService.create({
        userId: member.userId,
        title: 'New Channel Message',
        message: `${fullMessage.sender.firstName} sent a message in #${fullMessage.channel.name}`,
        link: `/dashboard/messages`, // adjust route if needed
      });

      this.notificationGateway.sendToUser(member.userId, notification);
    }

    return plainToInstance(
      MessageResponseDto,
      {
        ...fullMessage,
        channelId: fullMessage.channel.id,
      },
      { excludeExtraneousValues: true },
    );
  }

  async findAll(channelId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: { channelId },
      relations: ['sender', 'channel', 'statuses'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender', 'channel', 'statuses'],
    });
    if (!message)
      throw new NotFoundException(`Message with id ${id} not found`);
    return message;
  }

  async update(id: number, dto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    Object.assign(message, dto);
    return this.messageRepo.save(message);
  }

  async remove(id: number): Promise<void> {
    const result = await this.messageRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
  }
}
