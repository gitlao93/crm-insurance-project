import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SlackChannel } from './channel.entity';
import { User } from 'src/user/user.entities';

@Entity('slack_messages')
@Index(['channelId', 'createdAt'])
export class SlackMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SlackChannel, (ch) => ch.messages, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'channel_id' })
  channel: SlackChannel;

  @Column({ type: 'int', name: 'channel_id' })
  channelId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'int', name: 'sender_id' })
  senderId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
