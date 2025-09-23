import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Channel } from './channel.entity';
import { User } from 'src/user/user.entities';

export enum ChannelRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('channel_members')
@Unique(['channelId', 'userId']) // one membership per user per channel
export class ChannelMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.members, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @Column()
  @Index()
  channelId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: number;

  @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
  role: ChannelRole;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'int', nullable: true })
  lastReadMessageId: number | null;

  @CreateDateColumn()
  joinedAt: Date;
}
