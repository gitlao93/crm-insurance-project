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
import {
  AddChannelMemberDto,
  UpdateChannelMemberDto,
} from '../dto/channel-member.dto';
import { ChannelMember } from '../entities/channel-member.entity';
import { ChannelMembersService } from '../service/channel-members.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('channels/:channelId/members')
export class ChannelMembersController {
  constructor(private readonly memberService: ChannelMembersService) {}

  @Post()
  async add(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() dto: AddChannelMemberDto,
  ): Promise<ChannelMember> {
    return this.memberService.add({ ...dto, channelId });
  }

  @Get()
  async findAll(
    @Param('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMember[]> {
    return this.memberService.findAll(channelId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ChannelMember> {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChannelMemberDto,
  ): Promise<ChannelMember> {
    return this.memberService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.memberService.remove(id);
  }
}
