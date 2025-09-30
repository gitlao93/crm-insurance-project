import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from './agency.entities';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { User } from 'src/user/user.entities';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateAgencyDto): Promise<Agency> {
    const agency = this.agencyRepo.create(dto);
    return await this.agencyRepo.save(agency);
  }

  async findAll(): Promise<Agency[]> {
    return await this.agencyRepo.find({
      relations: ['users'], // ✅ load related users if needed
    });
  }

  async findOne(id: number): Promise<Agency> {
    const agency = await this.agencyRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!agency) {
      throw new NotFoundException(`Agency with id ${id} not found`);
    }
    return agency;
  }

  async update(id: number, dto: UpdateAgencyDto): Promise<Agency> {
    const agency = await this.findOne(id);

    Object.assign(agency, dto);
    return await this.agencyRepo.save(agency);
  }

  async deactivate(id: number): Promise<void> {
    const agency = await this.agencyRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!agency) {
      throw new NotFoundException(`Agency with id ${id} not found`);
    }

    // mark agency as inactive
    agency.isActive = false;
    await this.agencyRepo.save(agency);

    // mark all child users as inactive
    if (agency.users.length > 0) {
      await this.userRepo.update({ agencyId: agency.id }, { isActive: false });
    }
  }

  async activate(id: number): Promise<void> {
    const agency = await this.agencyRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!agency) {
      throw new NotFoundException(`Agency with id ${id} not found`);
    }

    // mark agency as inactive
    agency.isActive = true;
    await this.agencyRepo.save(agency);

    // mark all child users as inactive
    if (agency.users.length > 0) {
      await this.userRepo.update({ agencyId: agency.id }, { isActive: true });
    }
  }
}
