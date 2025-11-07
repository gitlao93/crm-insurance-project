import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/user.entities';
import { SlackChannel } from './channel.entity';

export enum ChannelRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('slack_channel_members')
@Index(['channelId', 'userId'], { unique: true })
export class SlackChannelMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SlackChannel, (channel) => channel.members, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'channel_id' })
  channel: SlackChannel;

  @Column({ type: 'int', name: 'channel_id' })
  channelId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
  role: ChannelRole;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @CreateDateColumn({ type: 'datetime' })
  joinedAt: Date;
}
