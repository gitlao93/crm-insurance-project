import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateSoaDto } from './dto/create-soa.dto';
import { UpdateSoaDto } from './dto/update-soa.dto';
import { SOA } from './soa.entities';
import { Billing } from 'src/billing/billing.entities';
import { PolicyPlan } from 'src/policy-plan/policy-plan.entities';

@Injectable()
export class SoaService {
  constructor(
    @InjectRepository(SOA)
    private readonly soaRepo: Repository<SOA>,

    @InjectRepository(Billing)
    private readonly billingRepo: Repository<Billing>,

    @InjectRepository(PolicyPlan)
    private readonly planRepo: Repository<PolicyPlan>,
  ) {}

  async create(dto: CreateSoaDto, manager?: EntityManager): Promise<SOA> {
    // 🧠 Use the manager repositories if provided (transaction-aware)
    const soaRepository = manager ? manager.getRepository(SOA) : this.soaRepo;
    const planRepository = manager
      ? manager.getRepository(PolicyPlan)
      : this.planRepo;

    // ✅ Fetch plan
    const plan = await planRepository.findOne({
      where: { id: dto.policyPlanId },
    });
    if (!plan) throw new NotFoundException('Policy Plan not found');

    const totalPremium = dto.totalPremium ?? plan.premium * dto.duration;

    // ✅ Create SOA
    const soa = soaRepository.create({
      ...dto,
      totalPremium,
      totalPaid: 0,
      balance: totalPremium,
      policyNumber:
        dto.policyNumber ?? `POL-${Date.now()}-${dto.policyHolderId}`,
    });

    await soaRepository.save(soa);

    return soa;
  }

  findAll(): Promise<SOA[]> {
    return this.soaRepo.find({
      relations: ['policyHolder', 'policyPlan', 'billings'],
    });
  }

  async findOne(id: number): Promise<SOA> {
    const soa = await this.soaRepo.findOne({
      where: { id },
      relations: ['policyHolder', 'policyPlan', 'billings'],
    });
    if (!soa) throw new NotFoundException(`SOA #${id} not found`);
    return soa;
  }

  async update(id: number, dto: UpdateSoaDto): Promise<SOA> {
    await this.soaRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.soaRepo.delete(id);
  }
}
