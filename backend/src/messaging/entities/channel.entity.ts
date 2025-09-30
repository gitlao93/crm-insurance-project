import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/user.entities';
import { Agency } from 'src/agency/agency.entities';
import { ChannelMember } from './channel-member.entity';
import { Message } from './message.entity';

@Entity('channels')
@Index(['agencyId', 'name'], { unique: true }) // channel name unique per agency
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @ManyToOne(() => Agency, (agency) => agency.id, { onDelete: 'CASCADE' })
  agency: Agency;

  @Column()
  agencyId: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: number;

  @OneToMany(() => ChannelMember, (member) => member.channel)
  members: ChannelMember[];

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
