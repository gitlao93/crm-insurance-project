import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/user/user.entities';
import { Repository } from 'typeorm';
import { PolicyHolder } from './policy-holder.entities';
import { CreatePolicyHolderDto } from './dto/create-policy-holder.dto';
import { UpdatePolicyHolderDto } from './dto/update-policy-holder.dto';

@Injectable()
export class PolicyHolderService {
  constructor(
    @InjectRepository(PolicyHolder)
    private policyHolderRepository: Repository<PolicyHolder>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreatePolicyHolderDto): Promise<PolicyHolder> {
    const lead = this.policyHolderRepository.create(dto);
    return this.policyHolderRepository.save(lead);
  }

  async findAll(userId?: number) {
    if (!userId) {
      console.log('Fetching all leads without user filter');
      return this.policyHolderRepository.find({
        relations: ['agent', 'policyPlan'],
      });
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && user.role === UserRole.AGENT) {
      return this.policyHolderRepository.find({
        where: { agentId: userId },
        relations: ['agent', 'policyPlan'],
      });
    }

    if (user && user.role === UserRole.ADMIN) {
      return this.policyHolderRepository.find({
        where: { agencyId: user.agencyId },
        relations: ['agent', 'policyPlan'],
      });
    }
  }

  async findOne(id: number): Promise<PolicyHolder> {
    const lead = await this.policyHolderRepository.findOne({
      where: { id },
      relations: ['agent', 'policyPlan', 'policyPlan.category'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: number, dto: UpdatePolicyHolderDto): Promise<PolicyHolder> {
    await this.policyHolderRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.policyHolderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }
}
