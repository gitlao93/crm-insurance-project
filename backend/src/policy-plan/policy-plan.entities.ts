import { PolicyCategory } from 'src/policy-category/policy-category.entities';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('policy_plans')
export class PolicyPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  planName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyRate: number;

  @Column({ type: 'varchar', default: 'PHP' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  coverageAmount: number;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column()
  categoryId: number;

  @ManyToOne(() => PolicyCategory, (category) => category.plans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: PolicyCategory;
}
