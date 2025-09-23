import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageStatus } from '../entities/message-status.entity';
import { UpdateMessageStatusDto } from '../dto/message-status.dto';

@Injectable()
export class MessageStatusService {
  constructor(
    @InjectRepository(MessageStatus)
    private readonly statusRepo: Repository<MessageStatus>,
  ) {}

  async findAll(messageId: number): Promise<MessageStatus[]> {
    return this.statusRepo.find({
      where: { messageId },
      relations: ['user', 'message'],
    });
  }

  async findOne(id: number): Promise<MessageStatus> {
    const status = await this.statusRepo.findOne({
      where: { id },
      relations: ['user', 'message'],
    });
    if (!status)
      throw new NotFoundException(`MessageStatus with id ${id} not found`);
    return status;
  }

  async update(
    id: number,
    dto: UpdateMessageStatusDto,
  ): Promise<MessageStatus> {
    const status = await this.findOne(id);
    Object.assign(status, dto);
    return this.statusRepo.save(status);
  }
}
