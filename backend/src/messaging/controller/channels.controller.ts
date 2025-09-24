import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from '../dto/channel.dto';
import { Channel } from '../entities/channel.entity';
import { ChannelsService } from '../service/channels.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  @Post()
  async create(@Body() dto: CreateChannelDto): Promise<Channel> {
    return this.channelService.create(dto);
  }

  @Get()
  async findAll(): Promise<Channel[]> {
    return this.channelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Channel> {
    return this.channelService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.channelService.remove(id);
  }
}
