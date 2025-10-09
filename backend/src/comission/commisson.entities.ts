import { Billing } from 'src/billing/billing.entities';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import { SOA } from 'src/soa/soa.entities';
import { User } from 'src/user/user.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Billing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billingId' })
  billing: Billing;

  @Column()
  billingId: number;

  @ManyToOne(() => SOA, { eager: true })
  @JoinColumn({ name: 'soaId' })
  soa: SOA;

  @Column()
  soaId: number;

  @ManyToOne(() => PolicyPlan, { eager: true })
  @JoinColumn({ name: 'policyPlanId' })
  policyPlan: PolicyPlan;

  @Column()
  policyPlanId: number;

  @ManyToOne(() => PolicyHolder, { eager: true })
  @JoinColumn({ name: 'policyHolderId' })
  policyHolder: PolicyHolder;

  @Column()
  policyHolderId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column()
  agentId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // calculated commission

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
