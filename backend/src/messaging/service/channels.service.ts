import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto, UpdateChannelDto } from '../dto/channel.dto';
import { ChannelMember, ChannelRole } from '../entities/channel-member.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,

    @InjectRepository(ChannelMember)
    private readonly channelMemberRepo: Repository<ChannelMember>,
  ) {}

  async create(dto: CreateChannelDto): Promise<Channel> {
    const channel = this.channelRepo.create(dto);
    const savedChannel = await this.channelRepo.save(channel);

    if (dto.createdById) {
      const member = this.channelMemberRepo.create({
        channelId: savedChannel.id,
        userId: dto.createdById,
        role: ChannelRole.OWNER,
      });
      await this.channelMemberRepo.save(member);
    }

    return savedChannel;
    return this.channelRepo.save(channel);
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepo.find({ relations: ['createdBy'] });
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelRepo.findOne({
      where: { id },
      relations: ['createdBy', 'members'],
    });
    if (!channel)
      throw new NotFoundException(`Channel with id ${id} not found`);
    return channel;
  }

  async update(id: number, dto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findOne(id);
    Object.assign(channel, dto);
    return this.channelRepo.save(channel);
  }

  async remove(id: number): Promise<void> {
    const result = await this.channelRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }
  }
}
