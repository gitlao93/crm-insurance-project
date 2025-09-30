import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user/user.entities';

export enum MessageStatusEnum {
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('message_statuses')
@Unique(['messageId', 'userId']) // each user per message
export class MessageStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.statuses, {
    onDelete: 'CASCADE',
  })
  message: Message;

  @Column()
  @Index()
  messageId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: number;

  @Column({ type: 'enum', enum: MessageStatusEnum })
  status: MessageStatusEnum;

  @CreateDateColumn()
  createdAt: Date;
}
