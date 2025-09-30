import { LeadInteraction } from 'src/lead-interaction/lead-interaction.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { User } from 'src/user/user.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum LeadStatus {
  NEW = 'New',
  IN_PROGRESS = 'In-Progress',
  CONVERTED = 'Converted',
  DROPPED = 'Dropped',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column()
  agentId: number;

  @Column()
  agencyId: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ nullable: true })
  policyPlanId: number;

  @ManyToOne(() => PolicyPlan, (plan) => plan.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'policyPlanId' })
  policyPlan: PolicyPlan;

  @OneToMany(() => LeadInteraction, (interaction) => interaction.lead)
  interactions: LeadInteraction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
