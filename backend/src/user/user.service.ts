import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Quota } from 'src/quota/entities/quota.entity';
import { AgentQuota } from 'src/quota/entities/agent-quota.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Quota)
    private readonly quotaRepo: Repository<Quota>,

    @InjectRepository(AgentQuota)
    private readonly agentQuotaRepo: Repository<AgentQuota>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    console.log(dto.password);
    const password = dto.password ?? 'password123';
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    if (user.role === UserRole.AGENT) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      // Find quotas for current month and beyond
      const activeQuotas = await this.quotaRepo
        .createQueryBuilder('q')
        .where('(q.year > :year) OR (q.year = :year AND q.month >= :month)', {
          year: currentYear,
          month: currentMonth,
        })
        .getMany();

      if (activeQuotas.length > 0) {
        const agentQuotas = activeQuotas.map((quota) =>
          this.agentQuotaRepo.create({
            quota,
            agent: user,
            achievedPolicies: 0,
            achievementRate: 0,
          }),
        );

        await this.agentQuotaRepo.save(agentQuotas);
        console.log(
          `✅ Assigned ${agentQuotas.length} active quotas to agent ${user.email}`,
        );
      } else {
        console.log('ℹ️ No active quotas found for this agent.');
      }
    }

    // Return with agency + supervisor for proper response DTO
    console.log('New user created with ID:', user);
    return this.findOne(user.id);
  }

  async findAll(agencyId?: number): Promise<UserResponseDto[]> {
    if (agencyId) {
      const user = await this.userRepo.find({
        where: { agencyId },
        relations: ['agency', 'supervisor'],
      });

      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    }
    const user = await this.userRepo.find({
      relations: ['agency', 'supervisor'],
    });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['agency', 'supervisor'],
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['agency', 'supervisor'], // include relations if needed
    });
    return user;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['agency', 'supervisor'],
    });
    return !!user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['supervisor', 'agency'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle supervisorId separately
    if (dto.supervisorId !== undefined) {
      if (dto.supervisorId === null) {
        user.supervisor = null;
        user.supervisorId = null;
      } else {
        const supervisor = await this.userRepo.findOne({
          where: { id: dto.supervisorId },
        });
        if (!supervisor) {
          throw new NotFoundException(
            `Supervisor with ID ${dto.supervisorId} not found`,
          );
        }
        user.supervisor = supervisor;
        user.supervisorId = supervisor.id;
      }
    }

    // Merge other fields (except supervisorId)
    Object.assign(user, { ...dto, supervisorId: user.supervisorId });

    await this.userRepo.save(user);

    // Reload to return fresh relations
    return this.userRepo.findOne({
      where: { id },
      relations: ['supervisor', 'agency'],
    });
  }

  async deactivate(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.isActive = false;
    await this.userRepo.save(user);
  }

  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await this.userRepo.save(user);
  }

  async activate(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.isActive = true;
    await this.userRepo.save(user);
  }
}

