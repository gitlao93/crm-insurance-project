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
      agencyName: 'Goodlife Damayan CDO',
      street: '123 Main St',
      cityMunicipality: 'Cagayan de Oro',
      postalCode: '12345',
      email: 'cdo@mail.com',
      phoneNumber: '09123456789',
      landLine: '1234567',
      isActive: true,
    });
    await this.agencyRepo.save(mainAgency);

    // --- Create Users ---
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = this.userRepo.create({
      firstName: 'GoodLife',
      lastName: 'Damayan',
      email: 'admin@goodlifedamayan.com',
      password: passwordHash,
      phoneNumber: '09112223333',
      landlineNumber: null,
      officeHours: '8:00am to 5:00pm',
      role: UserRole.ADMIN,
      isActive: true,
      agency: mainAgency,
      agencyId: mainAgency.id,
      supervisor: null,
      supervisorId: null,
    });
    await this.userRepo.save(admin);

    console.log('✅ Database seed completed!');
  }
}
