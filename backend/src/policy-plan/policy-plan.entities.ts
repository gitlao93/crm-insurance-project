import { PolicyCategory } from 'src/policy-category/policy-category.entities';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

export enum PolicyType {
  LIFE = 'Life Plan',
  BURIAL = 'Burial Plan',
}

export enum PolicyTerm {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  ANNUALLY = 'Annually',
}

export enum ClaimType {
  DEATH = 'Death',
  BURIAL = 'Burial',
  ACCIDENT = 'Accident',
  HOSPITALIZATION = 'Hospitalization',
}

@Entity('policy_plans')
export class PolicyPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  policyName: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
    default: PolicyType.LIFE,
  })
  policyType: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyTerm,
    default: PolicyTerm.MONTHLY,
  })
  term: PolicyTerm;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  commission_rate: number; // ✅ fixed type

  @Column({ type: 'int' })
  premium: number;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column()
  categoryId: number;

  @ManyToOne(() => PolicyCategory, (category) => category.plans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: PolicyCategory;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  benefits: Record<ClaimType, number>;
}
