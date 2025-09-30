import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelMember } from '../entities/channel-member.entity';
import {
  AddChannelMemberDto,
  UpdateChannelMemberDto,
} from '../dto/channel-member.dto';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMember)
    private readonly memberRepo: Repository<ChannelMember>,
  ) {}

  async add(dto: AddChannelMemberDto): Promise<ChannelMember> {
    const member = this.memberRepo.create(dto);
    return this.memberRepo.save(member);
  }

  async findAll(channelId: number): Promise<ChannelMember[]> {
    return this.memberRepo.find({
      where: { channelId },
      relations: ['user', 'channel'],
    });
  }

  async findOne(id: number): Promise<ChannelMember> {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: ['user', 'channel'],
    });
    if (!member) throw new NotFoundException(`Member with id ${id} not found`);
    return member;
  }

  async update(
    id: number,
    dto: UpdateChannelMemberDto,
  ): Promise<ChannelMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.memberRepo.save(member);
  }

  async remove(id: number): Promise<void> {
    const result = await this.memberRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ChannelMember with id ${id} not found`);
    }
  }
}
