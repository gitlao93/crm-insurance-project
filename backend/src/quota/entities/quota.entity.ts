import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgentQuota } from './agent-quota.entity';

@Entity('quotas')
export class Quota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ default: 0 })
  targetPolicies: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AgentQuota, (aq) => aq.quota)
  agentQuotas: AgentQuota[];
}
