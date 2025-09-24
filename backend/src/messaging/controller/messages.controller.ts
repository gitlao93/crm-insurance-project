import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CreateMessageDto, UpdateMessageDto } from '../dto/message.dto';
import { Message } from '../entities/message.entity';
import { MessagesService } from '../service/messages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('channels/:channelId/messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post()
  async create(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() dto: CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.create({ ...dto, channelId });
  }

  @Get()
  async findAll(
    @Param('channelId', ParseIntPipe) channelId: number,
  ): Promise<Message[]> {
    return this.messageService.findAll(channelId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messageService.remove(id);
  }
}
