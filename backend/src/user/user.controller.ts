import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entities';
import { UserResponseDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Create
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    const loadedUser = await this.userService.findOne(user.id);
    return plainToInstance(UserResponseDto, loadedUser, {
      excludeExtraneousValues: true,
    });
  }

  // ✅ Find all (with optional agencyId filter)
  @Get()
  async findAll(@Query('agencyId') agencyId?: number) {
    if (agencyId) return this.userService.findAll(agencyId);
    return this.userService.findAll();
  }

  // ✅ Find one
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // ✅ Update
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  // ✅ Deactivate user
  @Patch('deactivate/:id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deactivate(id);
    return { message: `User with id ${id} has been Deactivated` };
  }

  // ✅ Activate user
  @Patch('activate/:id')
  async activate(@Param('id', ParseIntPipe) id: number) {
    await this.userService.activate(id);
    return { message: `User with id ${id} has been Deactivated` };
  }
}
