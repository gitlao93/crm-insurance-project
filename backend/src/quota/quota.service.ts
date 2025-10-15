import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quota } from './entities/quota.entity';
import { AgentQuota } from './entities/agent-quota.entity';
import { CreateQuotaDto } from './dto/create-quota.dto';
import { UpdateQuotaDto } from './dto/update-quota.dto';
import { UpdateAgentQuotaDto } from './dto/update-agent-quota.dto';
import { User, UserRole } from 'src/user/user.entities';

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(Quota)
    private quotaRepo: Repository<Quota>,

    @InjectRepository(AgentQuota)
    private agentQuotaRepo: Repository<AgentQuota>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createDto: Omit<CreateQuotaDto, 'adminId'>, adminId: number) {
    // Extract and normalize
    const { month, year } = createDto;

    // 🧩 Ensure month is a number (in case frontend sends a string)
    const numericMonth = Number(month);

    if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
      throw new BadRequestException(
        'Invalid month value. Must be between 1–12.',
      );
    }

    // ✅ Prevent duplicate quotas for same month/year
    const existingQuota = await this.quotaRepo.findOne({
      where: { month: numericMonth, year },
    });

    if (existingQuota) {
      throw new BadRequestException(
        `Quota for month ${numericMonth} and year ${year} already exists.`,
      );
    }

    // ✅ Create quota record
    const quota = this.quotaRepo.create({
      ...createDto,
      month: numericMonth,
      createdBy: adminId,
      updatedBy: adminId,
    });

    const savedQuota = await this.quotaRepo.save(quota);

    // ✅ Assign quota to all agents automatically
    const agents = await this.userRepo.find({
      where: { role: UserRole.AGENT },
    });

    const agentQuotas = agents.map((agent) =>
      this.agentQuotaRepo.create({
        quota: savedQuota,
        agent,
        achievedPolicies: 0,
        achievementRate: 0,
      }),
    );

    await this.agentQuotaRepo.save(agentQuotas);

    return {
      message: 'Quota created and assigned to all agents',
      quota: savedQuota,
    };
  }

  findAll() {
    return this.quotaRepo.find({
      relations: ['agentQuotas'],
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findOne(id: number) {
    const quota = await this.quotaRepo.findOne({
      where: { id },
      relations: ['agentQuotas', 'agentQuotas.agent'],
    });
    if (!quota) throw new NotFoundException('Quota not found');
    return quota;
  }

  async update(id: number, dto: UpdateQuotaDto, updatedBy: number) {
    const quota = await this.findOne(id);
    Object.assign(quota, dto, { updatedBy });
    return this.quotaRepo.save(quota);
  }

  async updateAgentQuota(agentQuotaId: number, dto: UpdateAgentQuotaDto) {
    const aq = await this.agentQuotaRepo.findOne({
      where: { id: agentQuotaId },
      relations: ['quota'],
    });
    if (!aq) throw new NotFoundException('Agent quota not found');

    Object.assign(aq, dto);
    return this.agentQuotaRepo.save(aq);
  }

  // quota.service.ts
  async updateAgentPerformance(agentId: number, date: Date = new Date()) {
    // 1️⃣ Extract numeric month (1–12) and year
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // 2️⃣ Find quota for that month/year
    const quota = await this.quotaRepo.findOne({
      where: { month, year },
    });
    console.log('Found quota for', month, year, ':', quota);
    if (!quota) return;

    // 3️⃣ Find the agent’s quota entry
    const agentQuota = await this.agentQuotaRepo.findOne({
      where: { quota: { id: quota.id }, agent: { id: agentId } },
      relations: ['quota', 'agent'],
    });
    if (!agentQuota) return;

    // 4️⃣ Increment achieved policies
    agentQuota.achievedPolicies += 1;

    // 5️⃣ Recalculate rate = (achieved / target) * 100
    const rate =
      quota.targetPolicies > 0
        ? (agentQuota.achievedPolicies / quota.targetPolicies) * 100
        : 0;

    agentQuota.achievementRate = parseFloat(rate.toFixed(2));

    await this.agentQuotaRepo.save(agentQuota);
  }

  async remove(id: number) {
    const quota = await this.findOne(id);
    return this.quotaRepo.remove(quota);
  }
}
