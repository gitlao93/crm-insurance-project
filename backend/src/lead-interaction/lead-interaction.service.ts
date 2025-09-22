import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeadInteraction } from './lead-interaction.entities';
import { Repository } from 'typeorm';
import { CreateLeadInteractionDto } from './dto/create-lead-interaction.dto';
import { UpdateLeadInteractionDto } from './dto/update-lead-interaction.dto';

@Injectable()
export class LeadInteractionService {
  constructor(
    @InjectRepository(LeadInteraction)
    private leadInteractionRepository: Repository<LeadInteraction>,
  ) {}

  async create(dto: CreateLeadInteractionDto): Promise<LeadInteraction> {
    const interaction = this.leadInteractionRepository.create(dto);
    return this.leadInteractionRepository.save(interaction);
  }

  async findAll(leadId: number): Promise<LeadInteraction[]> {
    return this.leadInteractionRepository.find({
      where: { leadId },
      relations: ['lead', 'agent'],
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<LeadInteraction> {
    const interaction = await this.leadInteractionRepository.findOne({
      where: { id },
      relations: ['lead', 'agent'],
    });
    if (!interaction) throw new NotFoundException('Interaction not found');
    return interaction;
  }

  async update(
    id: number,
    dto: UpdateLeadInteractionDto,
  ): Promise<LeadInteraction> {
    await this.leadInteractionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.leadInteractionRepository.delete(id);
  }
}
