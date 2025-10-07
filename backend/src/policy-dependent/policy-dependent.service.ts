import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { PolicyDependent } from './policy-dependent.entities';
import { CreatePolicyDependentDto } from './dto/create-policy-dependent.dto';
import { UpdatePolicyDependentDto } from './dto/update-policy-dependent.dto';

@Injectable()
export class PolicyDependentService {
  constructor(
    @InjectRepository(PolicyDependent)
    private readonly dependentRepo: Repository<PolicyDependent>,
    @InjectRepository(PolicyHolder)
    private readonly holderRepo: Repository<PolicyHolder>,
  ) {}

  async create(dto: CreatePolicyDependentDto): Promise<PolicyDependent> {
    const holder = await this.holderRepo.findOne({
      where: { id: Number(dto.policyHolderId) },
    });
    if (!holder) {
      throw new NotFoundException('Policy holder not found');
    }

    const dependent = this.dependentRepo.create({
      ...dto,
      policyHolder: holder,
    });
    return this.dependentRepo.save(dependent);
  }

  async findAll(): Promise<PolicyDependent[]> {
    return this.dependentRepo.find({ relations: ['policyHolder'] });
  }

  async findOne(id: number): Promise<PolicyDependent> {
    const dependent = await this.dependentRepo.findOne({
      where: { id: Number(id) },
      relations: ['policyHolder'],
    });
    if (!dependent) throw new NotFoundException('Dependent not found');
    return dependent;
  }

  async update(
    id: number,
    dto: UpdatePolicyDependentDto,
  ): Promise<PolicyDependent> {
    const dependent = await this.findOne(id);
    Object.assign(dependent, dto);
    return this.dependentRepo.save(dependent);
  }

  async remove(id: number): Promise<void> {
    const dependent = await this.findOne(id);
    await this.dependentRepo.remove(dependent);
  }

  async findByPolicyHolder(holderId: number): Promise<PolicyDependent[]> {
    return this.dependentRepo.find({ where: { policyHolderId: holderId } });
  }
}
