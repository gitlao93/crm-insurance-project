import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from '../entities/direct-message.entity';
import { CreateDirectMessageDto } from '../dto/direct-message.dto';
import { User } from 'src/user/user.entities';

@Injectable()
export class DirectMessageService {
  constructor(
    @InjectRepository(DirectMessage)
    private readonly dmRepository: Repository<DirectMessage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendMessage(dto: CreateDirectMessageDto): Promise<DirectMessage> {
    const sender = await this.userRepository.findOne({
      where: { id: dto.senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with ID ${dto.senderId} not found`);
    }

    const receiver = await this.userRepository.findOne({
      where: { id: dto.receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(
        `Receiver with ID ${dto.receiverId} not found`,
      );
    }

    const message = this.dmRepository.create({
      sender,
      receiver,
      content: dto.content,
    });

    return this.dmRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number) {
    return await this.dmRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: number, userId: number) {
    const message = await this.dmRepository.findOne({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    if (message.receiver.id !== userId) {
      throw new NotFoundException('Not authorized to mark this message');
    }

    message.isRead = true;
    return await this.dmRepository.save(message);
  }
}
