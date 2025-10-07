import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateDirectMessageDto {
  @Type(() => Number)
  @IsInt()
  senderId: number;

  @Type(() => Number)
  @IsInt()
  receiverId: number;

  @IsString()
  @MinLength(1)
  content: string;
}

export class UpdateDirectMessageDto {
  @IsString()
  @IsOptional()
  content?: string;
}

export class GetDirectMessagesDto {
  @IsUUID()
  otherUserId: number;

  @IsOptional()
  @IsUUID()
  lastMessageId?: number; // For pagination or loading history
}
