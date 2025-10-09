import { Billing } from 'src/billing/billing.entities';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { PolicyPlan, PolicyTerm } from 'src/policy-plan/policy-plan.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('soa')
export class SOA {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PolicyHolder, (holder) => holder.soa, { onDelete: 'CASCADE' })
  @JoinColumn()
  policyHolder: PolicyHolder;

  @Column()
  policyHolderId: number;

  @ManyToOne(() => PolicyPlan, { eager: true })
  @JoinColumn({ name: 'policyPlanId' })
  policyPlan: PolicyPlan;

  @Column()
  policyPlanId: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: PolicyTerm })
  paymentTerm: PolicyTerm; // derived from PolicyPlan.term

  @Column({ type: 'int' })
  duration: number; // number of months or years, same as PolicyPlan.duration

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  premiumPerTerm: number; // PolicyPlan.premium

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPremium: number; // premium * number of terms

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', nullable: true })
  policyNumber: string;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @OneToMany(() => Billing, (billing) => billing.soa)
  billings: Billing[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
