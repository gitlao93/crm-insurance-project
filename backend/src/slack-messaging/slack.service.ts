import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackChannel, ChannelType } from './entities/channel.entity';
import {
  SlackChannelMember,
  ChannelRole,
} from './entities/channel-member.entity';
import { SlackMessage } from './entities/message.entity';
import { User } from 'src/user/user.entities';

@Injectable()
export class SlackService {
  constructor(
    @InjectRepository(SlackChannel)
    private channelRepo: Repository<SlackChannel>,
    @InjectRepository(SlackChannelMember)
    private channelMemberRepo: Repository<SlackChannelMember>,
    @InjectRepository(SlackMessage)
    private messageRepo: Repository<SlackMessage>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // user must be in same agency as channel creation owner
  async createChannel(
    ownerId: number,
    dto: { name: string; type?: ChannelType; isDirect?: boolean },
  ) {
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');

    const ch = this.channelRepo.create({
      name: dto.name,
      type: dto.type ?? ChannelType.PUBLIC,
      isDirect: !!dto.isDirect,
      agencyId: owner.agencyId,
    });

    const saved = await this.channelRepo.save(ch);

    // create owner member record
    await this.channelMemberRepo.save(
      this.channelMemberRepo.create({
        channelId: saved.id,
        userId: ownerId,
        role: ChannelRole.OWNER,
      }),
    );

    return this.channelRepo.findOne({
      where: { id: saved.id },
      relations: ['members'],
    });
  }

  async listChannelsForUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // fetch channels in same agency (with members + their user info)
    const channels = await this.channelRepo.find({
      where: { agencyId: user.agencyId, isActive: true },
      relations: ['members', 'members.user'],
    });

    return channels.map((ch) => {
      if (ch.isDirect) {
        // find the other user in this DM
        const otherMember = ch.members.find((m) => m.userId !== userId);
        const otherUser = otherMember?.user;
        return {
          ...ch,
          displayName: otherUser
            ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
            : 'Direct Message',
        };
      }

      // normal (non-DM) channel
      return { ...ch, displayName: ch.name };
    });
  }

  async getChannel(channelId: number) {
    const ch = await this.channelRepo.findOne({
      where: { id: channelId },
      relations: ['members'],
    });
    if (!ch) throw new NotFoundException('Channel not found');
    return ch;
  }

  async addMember(channelId: number, actorId: number, userIdToAdd: number) {
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    // actor permission
    const actorMembership = await this.channelMemberRepo.findOne({
      where: { channelId, userId: actorId },
    });
    if (!actorMembership) throw new ForbiddenException('Not a member');
    if (
      ![ChannelRole.OWNER, ChannelRole.ADMIN].includes(actorMembership.role)
    ) {
      throw new ForbiddenException('Not permitted to add members');
    }

    // user same agency?
    const userToAdd = await this.userRepo.findOne({
      where: { id: userIdToAdd },
    });
    if (!userToAdd) throw new NotFoundException('User to add not found');
    if (userToAdd.agencyId !== channel.agencyId)
      throw new BadRequestException("User not in the channel's agency");

    // avoid duplicates
    const existing = await this.channelMemberRepo.findOne({
      where: { channelId, userId: userIdToAdd },
    });
    if (existing) return existing;

    const member = this.channelMemberRepo.create({
      channelId,
      userId: userIdToAdd,
      role: ChannelRole.MEMBER,
    });
    return this.channelMemberRepo.save(member);
  }

  async removeMember(
    channelId: number,
    actorId: number,
    userIdToRemove: number,
  ) {
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    const actorMembership = await this.channelMemberRepo.findOne({
      where: { channelId, userId: actorId },
    });
    if (!actorMembership) throw new ForbiddenException('Not a member');
    if (
      actorMembership.role !== ChannelRole.OWNER &&
      actorId !== userIdToRemove &&
      actorMembership.role !== ChannelRole.ADMIN
    ) {
      throw new ForbiddenException('Not permitted to remove members');
    }

    const member = await this.channelMemberRepo.findOne({
      where: { channelId, userId: userIdToRemove },
    });
    if (!member) throw new NotFoundException('Member not found');

    await this.channelMemberRepo.remove(member);
    return { success: true };
  }

  async userCanAccessChannel(userId: number, channelId: number) {
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
    });
    if (!channel) return false;
    // public channel in same agency
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return false;
    if (channel.agencyId !== user.agencyId) return false;
    if (channel.type === ChannelType.PUBLIC) return true;
    // private => must be a member
    const member = await this.channelMemberRepo.findOne({
      where: { channelId, userId },
    });
    return !!member;
  }

  async createDM(userAId: number, userBId: number) {
    if (userAId === userBId)
      throw new BadRequestException('Cannot DM yourself');
    const a = await this.userRepo.findOne({ where: { id: userAId } });
    const b = await this.userRepo.findOne({ where: { id: userBId } });
    if (!a || !b) throw new NotFoundException('User not found');
    if (a.agencyId !== b.agencyId)
      throw new BadRequestException('Users not in same agency');

    // Try to find existing DM channel (private + isDirect true + exactly these two members)
    // Simple approach: search for private direct channels in agency where both are members and the channel has isDirect=true
    const candidates = await this.channelRepo.find({
      where: {
        agencyId: a.agencyId,
        isDirect: true,
        type: ChannelType.PRIVATE,
      },
    });
    for (const c of candidates) {
      const members = await this.channelMemberRepo.find({
        where: { channelId: c.id },
      });
      const memberIds = members.map((m) => m.userId).sort();
      if (
        memberIds.length === 2 &&
        memberIds[0] === Math.min(userAId, userBId) &&
        memberIds[1] === Math.max(userAId, userBId)
      ) {
        return this.getChannel(c.id);
      }
    }

    // create new DM channel
    const ch = this.channelRepo.create({
      name: `DM:${Math.min(userAId, userBId)}:${Math.max(userAId, userBId)}`,
      type: ChannelType.PRIVATE,
      isDirect: true,
      agencyId: a.agencyId,
    });
    const saved = await this.channelRepo.save(ch);

    await this.channelMemberRepo.save(
      this.channelMemberRepo.create({
        channelId: saved.id,
        userId: userAId,
        role: ChannelRole.MEMBER,
      }),
    );
    await this.channelMemberRepo.save(
      this.channelMemberRepo.create({
        channelId: saved.id,
        userId: userBId,
        role: ChannelRole.MEMBER,
      }),
    );

    return this.getChannel(saved.id);
  }

  async createMessage(senderId: number, channelId: number, content: string) {
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    // enforce permission for private channels
    if (channel.type === ChannelType.PRIVATE) {
      const member = await this.channelMemberRepo.findOne({
        where: { channelId, userId: senderId },
      });
      if (!member)
        throw new ForbiddenException('Not a member of private channel');
    } else {
      // public channel => confirm same agency
      const sender = await this.userRepo.findOne({ where: { id: senderId } });
      if (!sender)
        throw new ForbiddenException('Sender not found or not allowed');
      if (sender.agencyId !== channel.agencyId)
        throw new ForbiddenException('Sender not in same agency as channel');
    }

    const msg = this.messageRepo.create({ channelId, senderId, content });
    const saved = await this.messageRepo.save(msg);
    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'channel'],
    });
  }

  async getChannelMemberIds(channelId: number) {
    const members = await this.channelMemberRepo.find({ where: { channelId } });
    return members.map((m) => m.userId);
  }

  async listMessages(channelId: number, limit = 50, before?: Date) {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.channelId = :channelId', { channelId })
      .orderBy('m.createdAt', 'DESC')
      .limit(limit);
    if (before) qb.andWhere('m.createdAt < :before', { before });
    const results = await qb.getMany();
    return results.reverse(); // return chronological
  }
}
