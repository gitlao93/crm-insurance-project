import { PolicyCategory } from 'src/policy-category/policy-category.entities';
import { User } from 'src/user/user.entities';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  agencyName: string;

  @Column({ type: 'varchar' })
  street: string;

  @Column({ type: 'varchar' })
  cityMunicipality: string;

  @Column({ type: 'varchar' })
  postalCode: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  landLine: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => User, (user) => user.agency)
  users: User[];

  @OneToMany(() => PolicyCategory, (category) => category.agency)
  policyCategories: PolicyCategory[];
}
