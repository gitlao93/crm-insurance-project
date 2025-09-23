import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ChannelResponseDto } from './channel.dto';
import { UserResponseDto } from 'src/user/dto/response-user.dto';
import { MessageStatusResponseDto } from './message-status.dto';

export class CreateMessageDto {
  @IsInt()
  channelId: number;

  @IsInt()
  senderId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;
}

export class MessageResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserResponseDto)
  sender: UserResponseDto;

  @Expose()
  @Type(() => ChannelResponseDto)
  channel: ChannelResponseDto;

  @Expose()
  @Type(() => MessageStatusResponseDto)
  statuses: MessageStatusResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
