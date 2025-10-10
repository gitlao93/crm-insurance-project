import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { ClaimType } from 'src/policy-plan/policy-plan.entities';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClaimStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid',
}

@Entity()
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 RELATION TO POLICY HOLDER
  @ManyToOne(() => PolicyHolder, (policyHolder) => policyHolder.claims, {
    onDelete: 'CASCADE',
  })
  policyHolder: PolicyHolder;

  @Column()
  policyHolderId: number;

  // 🎯 CLAIM TYPE
  @Column({ type: 'json', nullable: true })
  claimType: Record<ClaimType, number>;

  // 🧾 DESCRIPTION / NOTES
  @Column({ type: 'text', nullable: true })
  description?: string;

  // 📅 DATE OF CLAIM (filed by policyholder)
  @Column({ type: 'timestamp' })
  dateFiled: Date;

  // 🧾 APPROVAL STATUS
  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
  status: ClaimStatus;

  // 📅 DATE APPROVED / PAID
  @Column({ type: 'timestamp', nullable: true })
  dateProcessed?: Date;

  // 🧍‍♂️ PROCESSING STAFF / APPROVER ID (optional, if you have Users)
  @Column({ nullable: true })
  processedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
