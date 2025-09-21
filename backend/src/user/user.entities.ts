import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Agency } from 'src/agency/agency.entities';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  COLLECTION_SUPERVISOR = 'collection_supervisor',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  landlineNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  officeHours: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Agency, (agency) => agency.users, { eager: true })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency;

  @Column({ type: 'int', name: 'agency_id' })
  agencyId: number;

  @ManyToOne(() => User, (user) => user.subordinates, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User | null;

  @Column({ type: 'int', name: 'supervisor_id', nullable: true })
  supervisorId: number | null;

  @OneToMany(() => User, (user) => user.supervisor)
  subordinates: User[];
}
