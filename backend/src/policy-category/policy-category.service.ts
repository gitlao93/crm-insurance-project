import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyCategory } from './policy-category.entities';
import { CreatePolicyCategoryDto } from './dto/create-policy-category.dto';
import { UpdatePolicyCategoryDto } from './dto/update-policy-category.dto';
import { Agency } from 'src/agency/agency.entities';

@Injectable()
export class PolicyCategoryService {
  constructor(
    @InjectRepository(PolicyCategory)
    private categoryRepository: Repository<PolicyCategory>,

    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  async create(dto: CreatePolicyCategoryDto): Promise<PolicyCategory> {
    const agency = await this.agencyRepository.findOne({
      where: { id: dto.agencyId },
    });
    if (!agency) {
      throw new NotFoundException(`Agency with id ${dto.agencyId} not found`);
    }
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll(agencyId?: number): Promise<PolicyCategory[]> {
    const where = agencyId ? { agencyId } : {};
    return this.categoryRepository.find({
      where,
      relations: ['plans', 'agency'],
    });
  }

  async findOne(id: number): Promise<PolicyCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['plans'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    dto: UpdatePolicyCategoryDto,
  ): Promise<PolicyCategory> {
    await this.categoryRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
