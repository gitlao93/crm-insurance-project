import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead, LeadStatus } from './lead.entities';
import { Repository } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { User, UserRole } from 'src/user/user.entities';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepository.create(dto);
    return this.leadRepository.save(lead);
  }

  async findAll(userId?: number) {
    if (!userId) {
      console.log('Fetching all leads without user filter');
      return this.leadRepository.find({
        relations: ['agent', 'policyPlan', 'interactions'],
      });
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && user.role === UserRole.AGENT) {
      return this.leadRepository.find({
        where: { agentId: userId },
        relations: ['agent', 'policyPlan', 'interactions'],
      });
    }

    if (user && user.role === UserRole.ADMIN) {
      return this.leadRepository.find({
        where: { agencyId: user.agencyId },
        relations: ['agent', 'policyPlan', 'interactions'],
      });
    }
  }

  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['agent', 'policyPlan', 'policyPlan.category', 'interactions'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: number, dto: UpdateLeadDto): Promise<Lead> {
    await this.leadRepository.update(id, dto);
    return this.findOne(id);
  }

  async dropLead(id: number): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = LeadStatus.DROPPED;
    return this.leadRepository.save(lead);
  }

  async remove(id: number): Promise<void> {
    const result = await this.leadRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }
}
