import { Lead } from 'src/lead/lead.entities';
import { User } from 'src/user/user.entities';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InteractionType {
  CALL = 'call',
  MEETING = 'meeting',
  FOLLOW_UP = 'follow-up',
  EMAIL = 'email',
}

export enum InteractionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  RESCHEDULED = 'Rescheduled',
}

@Entity()
export class LeadInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leadId: number;

  @Column()
  agentId: number;

  @Column({
    type: 'enum',
    enum: InteractionType,
    default: InteractionType.CALL,
  })
  type: InteractionType;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: InteractionStatus,
    default: InteractionStatus.PENDING,
  })
  status: InteractionStatus;

  @ManyToOne(() => Lead, (lead) => lead.interactions, { onDelete: 'CASCADE' })
  lead: Lead;

  @ManyToOne(() => User, (user) => user.interactions, { onDelete: 'CASCADE' })
  agent: User;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
