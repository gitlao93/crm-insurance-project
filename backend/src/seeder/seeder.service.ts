import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from 'src/agency/agency.entities';
import { User, UserRole } from 'src/user/user.entities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async run() {
    console.log('🌱 Starting database seed...');

    // --- Create Agencies ---
    const mainAgency = this.agencyRepo.create({
      agencyName: 'CDO Branch',
      street: '123 Main St',
      cityMunicipality: 'Metro City',
      postalCode: '12345',
      email: 'cdo@mail.com',
      phoneNumber: '09123456789',
      landLine: '1234567',
      isActive: true,
    });
    await this.agencyRepo.save(mainAgency);

    const subAgency = this.agencyRepo.create({
      agencyName: 'Malaybalay Branch',
      street: '456 Side St',
      cityMunicipality: 'Small Town',
      postalCode: '67890',
      email: 'malaybalayh@mail.com',
      phoneNumber: '09987654321',
      isActive: true,
    });
    await this.agencyRepo.save(subAgency);

    // --- Create Users ---
    const passwordHash = await bcrypt.hash('password123', 10);

    const superAdmin = this.userRepo.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'superadmin@mail.com',
      password: passwordHash,
      phoneNumber: '09112223333',
      landlineNumber: null,
      officeHours: '9-5',
      role: UserRole.ADMIN,
      isActive: true,
      agency: mainAgency,
      agencyId: mainAgency.id,
      supervisor: null,
      supervisorId: null,
    });
    await this.userRepo.save(superAdmin);

    const supervisor = this.userRepo.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@mail.com',
      password: passwordHash,
      phoneNumber: '09113334444',
      landlineNumber: null,
      officeHours: '10-6',
      role: UserRole.COLLECTION_SUPERVISOR,
      isActive: true,
      agency: mainAgency,
      agencyId: mainAgency.id,
      supervisor: superAdmin,
      supervisorId: superAdmin.id,
    });
    await this.userRepo.save(supervisor);

    const agent = this.userRepo.create({
      firstName: 'Smith',
      lastName: 'Doe',
      email: 'smith@mail.com',
      password: passwordHash,
      phoneNumber: '09113335555',
      landlineNumber: null,
      officeHours: '10-6',
      role: UserRole.AGENT,
      isActive: true,
      agency: mainAgency,
      agencyId: mainAgency.id,
      supervisor: supervisor,
      supervisorId: supervisor.id,
    });
    await this.userRepo.save(agent);

    console.log('✅ Database seed completed!');
  }
}
