import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Claim, ClaimStatus } from './claim.entities';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,

    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,
  ) {}

  // ✅ Create Claim
  async create(dto: CreateClaimDto): Promise<Claim> {
    const holder = await this.policyHolderRepository.findOne({
      where: { id: dto.policyHolderId },
      relations: ['policyPlan'],
    });
    if (!holder) throw new NotFoundException('Policy Holder not found');

    // Optional: Auto-fill amount from policy plan benefits
    const claim = this.claimRepository.create({
      ...dto,
      dateFiled: dto.dateFiled || new Date(),
      status: dto.status || ClaimStatus.PENDING,
    });

    claim.policyHolder = holder;
    return this.claimRepository.save(claim);
  }

  // ✅ Find All Claims (optional filters)
  async findAll(policyHolderId?: number): Promise<Claim[]> {
    if (policyHolderId) {
      return this.claimRepository.find({
        where: { policyHolder: { id: policyHolderId } },
        relations: ['policyHolder', 'policyHolder.policyPlan'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.claimRepository.find({
      relations: ['policyHolder', 'policyHolder.policyPlan'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Find One
  async findOne(id: number): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: ['policyHolder', 'policyHolder.policyPlan'],
    });
    if (!claim) throw new NotFoundException(`Claim with ID ${id} not found`);
    return claim;
  }

  // ✅ Update
  async update(id: number, dto: UpdateClaimDto): Promise<Claim> {
    const claim = await this.findOne(id);
    Object.assign(claim, dto);
    await this.claimRepository.save(claim);
    return this.findOne(id);
  }

  // ✅ Change Status Shortcut
  async updateStatus(id: number, status: ClaimStatus): Promise<Claim> {
    const claim = await this.findOne(id);
    claim.status = status;
    claim.dateProcessed = new Date();
    return this.claimRepository.save(claim);
  }

  // ✅ Delete
  async remove(id: number): Promise<void> {
    const result = await this.claimRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
  }
}
