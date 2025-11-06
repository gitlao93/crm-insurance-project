import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { SlackService } from './slack.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateDmDto } from './dto/create-dm.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Post('channels')
  createChannel(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateChannelDto,
  ) {
    return this.slackService.createChannel(req.user.id, dto);
  }

  @Get('channels')
  listChannels(@Req() req: { user: { id: number } }) {
    return this.slackService.listChannelsForUser(req.user.id);
  }

  @Get('channels/:id')
  getChannel(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.slackService.getChannel(id);
  }

  @Post('channels/:id/members')
  addMember(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddMemberDto,
  ) {
    return this.slackService.addMember(id, req.user.id, body.userId);
  }

  @Delete('channels/:id/members/:userId')
  removeMember(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.slackService.removeMember(id, req.user.id, userId);
  }

  @Get('channels/:id/messages')
  listMessages(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    const beforeDate = before ? new Date(before) : undefined;
    return this.slackService.listMessages(id, lim, beforeDate);
  }

  @Post('messages')
  sendMessage(
    @Req() req: { user: { id: number } },
    @Body() dto: SendMessageDto,
  ) {
    return this.slackService.createMessage(
      req.user.id,
      dto.channelId,
      dto.content,
    );
  }

  @Post('direct')
  createOrGetDM(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateDmDto,
  ) {
    return this.slackService.createDM(req.user.id, dto.withUserId);
  }
}
