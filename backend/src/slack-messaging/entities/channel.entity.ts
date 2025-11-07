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
import { Agency } from 'src/agency/agency.entities';
import { SlackChannelMember } from './channel-member.entity';
import { SlackMessage } from './message.entity';

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('slack_channels')
@Index(['agencyId', 'name'], { unique: false })
export class SlackChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.PUBLIC })
  type: ChannelType;

  @ManyToOne(() => Agency, { onDelete: 'CASCADE', eager: true })
  agency: Agency;

  @Column({ type: 'int', name: 'agency_id' })
  agencyId: number;

  @Column({ type: 'boolean', default: false })
  isDirect: boolean;

  @OneToMany(() => SlackChannelMember, (cm) => cm.channel, { cascade: true })
  members: SlackChannelMember[];

  @OneToMany(() => SlackMessage, (msg) => msg.channel)
  messages: SlackMessage[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
