import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Claim, ClaimStatus } from './claim.entities';
import { PolicyHolder } from 'src/policy-holder/policy-holder.entities';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';
import { NotificationsService } from 'src/notification/notification.service';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,

    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,

    private readonly notificationService: NotificationsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // ✅ Create Claim
  async create(dto: CreateClaimDto): Promise<Claim> {
    const holder = await this.policyHolderRepository.findOne({
      where: { id: dto.policyHolderId },
      relations: ['policyPlan'],
    });
    if (!holder) throw new NotFoundException('Policy Holder not found');

    const claim = this.claimRepository.create({
      ...dto,
      dateFiled: dto.dateFiled || new Date(),
      status: dto.status || ClaimStatus.PENDING,
    });

    claim.policyHolder = holder;
    const savedClaim = await this.claimRepository.save(claim);

    // 🟢 Find agency admin
    const admin = await this.notificationService.findAgencyAdmin(
      holder.agencyId,
    );
    if (admin) {
      const notification = await this.notificationService.create({
        userId: admin.id,
        title: 'New Claim Filed',
        message: `A new claim has been filed by ${holder.firstName} ${holder.lastName}.`,
        link: `/claim-request`,
      });
      console.log('Notification sent to agency admin:', notification);
      this.notificationGateway.sendToUser(admin.id, notification);
    }

    return savedClaim;
  }

  // ✅ Find All Claims (optional filters)
  async findAll(agencyId?: number, policyHolderId?: number): Promise<Claim[]> {
    if (policyHolderId) {
      return this.claimRepository.find({
        where: { policyHolder: { id: policyHolderId } },
        relations: [
          'policyHolder',
          'policyHolder.policyPlan',
          'policyHolder.agent',
        ],
        order: { createdAt: 'DESC' },
      });
    }

    if (agencyId) {
      return this.claimRepository.find({
        where: { policyHolder: { agencyId: agencyId } },
        relations: [
          'policyHolder',
          'policyHolder.policyPlan',
          'policyHolder.agent',
        ],
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
