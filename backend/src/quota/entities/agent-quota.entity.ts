import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Quota } from './quota.entity';
import { User } from 'src/user/user.entities';

@Entity('agent_quotas')
export class AgentQuota {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quota, (quota) => quota.agentQuotas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotaId' })
  quota: Quota;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ default: 0 })
  achievedPolicies: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  achievementRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
