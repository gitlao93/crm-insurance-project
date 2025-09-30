import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UpdateMessageStatusDto } from '../dto/message-status.dto';
import { MessageStatus } from '../entities/message-status.entity';
import { MessageStatusService } from '../service/message-status.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages/:messageId/statuses')
export class MessageStatusesController {
  constructor(private readonly statusService: MessageStatusService) {}

  @Get()
  async findAll(
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<MessageStatus[]> {
    return this.statusService.findAll(messageId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MessageStatus> {
    return this.statusService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMessageStatusDto,
  ): Promise<MessageStatus> {
    return this.statusService.update(id, dto);
  }
}
