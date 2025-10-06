import { Lead } from 'src/lead/lead.entities';
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
  OneToOne,
} from 'typeorm';

export enum PolicyHolderStatus {
  ACTIVE = 'Active',
  RENEWALDUE = 'Renewal Due',
  LAPSABLE = 'Lapsable',
  LAPSED = 'Lapsed',
  CANCELLED = 'Cancelled',
}

@Entity('policy_holders')
export class PolicyHolder {
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

  @Column({
    type: 'enum',
    enum: PolicyHolderStatus,
    default: PolicyHolderStatus.ACTIVE,
  })
  status: PolicyHolderStatus;

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

  @Column()
  StartDate: Date;

  @Column()
  EndDate: Date;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  leadId: number;

  @OneToOne(() => Lead, (lead) => lead.policyHolder, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
