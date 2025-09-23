import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/user.entities';
import { Channel } from './channel.entity';
import { MessageStatus } from './message-status.entity';

@Entity('messages')
@Index(['channelId', 'createdAt']) // fast retrieval per channel
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @Column()
  channelId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  sender: User;

  @Column({ nullable: true })
  senderId: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Message, (msg) => msg.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentMessage: Message | null;

  @Column({ nullable: true })
  parentMessageId: number | null;

  @OneToMany(() => Message, (msg) => msg.parentMessage)
  replies: Message[];

  @OneToMany(() => MessageStatus, (status) => status.message)
  statuses: MessageStatus[];

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
