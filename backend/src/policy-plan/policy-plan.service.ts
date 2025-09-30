import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePolicyPlanDto } from './dto/create-policy-plan.dto';
import { UpdatePolicyPlanDto } from './dto/update-policy-plan.dto';
import { PolicyPlan } from './policy-plan.entities';
import { PolicyCategory } from 'src/policy-category/policy-category.entities';

@Injectable()
export class PolicyPlanService {
  constructor(
    @InjectRepository(PolicyPlan)
    private planRepository: Repository<PolicyPlan>,
    @InjectRepository(PolicyCategory)
    private categoryRepository: Repository<PolicyCategory>,
  ) {}

  async create(dto: CreatePolicyPlanDto): Promise<PolicyPlan> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
    }

    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async findAll(categoryId?: number): Promise<PolicyPlan[]> {
    const where = categoryId ? { categoryId } : {};
    return this.planRepository.find({
      where,
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<PolicyPlan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: number, dto: UpdatePolicyPlanDto): Promise<PolicyPlan> {
    await this.planRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }
}
