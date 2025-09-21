import { Agency } from 'src/agency/agency.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('policy_categories')
export class PolicyCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'agency_id' })
  agencyId: number;

  @OneToMany(() => PolicyPlan, (plan) => plan.category)
  plans: PolicyPlan[];

  @ManyToOne(() => Agency, (agency) => agency.policyCategories, { eager: true })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;
}
