import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DirectMessageService } from '../service/direct-message.service';
import { CreateDirectMessageDto } from '../dto/direct-message.dto';

@Controller('direct-messages')
export class DirectMessageController {
  constructor(private readonly dmService: DirectMessageService) {}

  @Post()
  async sendMessage(@Body() dto: CreateDirectMessageDto) {
    return this.dmService.sendMessage(dto);
  }

  @Get(':userId1/:userId2')
  async getConversation(
    @Param('userId1', ParseIntPipe) userId1: number,
    @Param('userId2', ParseIntPipe) userId2: number,
  ) {
    return this.dmService.getConversation(userId1, userId2);
  }
}
