import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entities';
import { UserResponseDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    const exists = await this.userService.emailExists(email);
    return { exists };
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
  ) {
    return this.userService.update(id, dto);
  }

  // ✅ Deactivate user
  @Patch('deactivate/:id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deactivate(id);
    return { message: `User with id ${id} has been Deactivated` };
  }

  @Patch(':id/change-password')
  changePassword(
    @Param('id') id: number,
    @Body() dto: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  // ✅ Activate user
  @Patch('activate/:id')
  async activate(@Param('id', ParseIntPipe) id: number) {
    await this.userService.activate(id);
    return { message: `User with id ${id} has been Deactivated` };
  }
}
