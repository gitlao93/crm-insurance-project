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

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
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
