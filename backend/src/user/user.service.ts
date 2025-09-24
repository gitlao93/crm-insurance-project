import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, dto);
    return await this.userRepo.save(user);
  }

  async deactivate(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.isActive = false;
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
