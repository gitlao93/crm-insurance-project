import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead, LeadStatus } from './lead.entities';
import { In, Repository } from 'typeorm';
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
        order: { createdAt: 'DESC' }, // 👈 newest first
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subordinates'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.AGENT) {
      return this.leadRepository.find({
        where: { agentId: userId },
        relations: ['agent', 'policyPlan', 'interactions'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.ADMIN) {
      return this.leadRepository.find({
        where: { agencyId: user.agencyId },
        relations: ['agent', 'policyPlan', 'interactions'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.COLLECTION_SUPERVISOR) {
      const subordinateIds =
        user.subordinates
          ?.filter((agent) => agent.isActive)
          .map((agent) => agent.id) ?? [];

      if (subordinateIds.length === 0) {
        console.log(`Supervisor ${user.id} has no active agents`);
        return [];
      }

      return this.leadRepository.find({
        where: { agentId: In(subordinateIds) },
        relations: ['agent', 'policyPlan', 'interactions'],
        order: { createdAt: 'DESC' },
      });
    }

    // 👑 Super Admin or fallback
    return this.leadRepository.find({
      relations: ['agent', 'policyPlan', 'interactions'],
      order: { createdAt: 'DESC' },
    });
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
