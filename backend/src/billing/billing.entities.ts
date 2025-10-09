import { SOA } from 'src/soa/soa.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BillingStatus {
  PENDING = 'Pending', // amount_paid = 0 and due date not yet passed
  PAID = 'Paid', // amount_paid = amount_due → fully settled
  OVERDUE = 'Overdue', // amount_paid < amount_due and due date passed
  LAPSED = 'Lapsed', // unpaid payments
}

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SOA, (soa) => soa.billings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'soaId' })
  soa: SOA;

  @Column()
  soaId: number;

  @Column({ type: 'int' })
  installmentNumber: number; // e.g. 1..12 for monthly

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  status: BillingStatus;

  @Column({ type: 'varchar', nullable: true })
  receiptNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
