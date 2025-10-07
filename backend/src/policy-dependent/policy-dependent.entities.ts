import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';

@Entity()
export class PolicyDependent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  relationship?: string; // e.g. spouse, child, parent, etc.

  @ManyToOne(() => PolicyHolder, (policyHolder) => policyHolder.dependents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyHolderId' })
  policyHolder: PolicyHolder;

  @Column()
  policyHolderId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
