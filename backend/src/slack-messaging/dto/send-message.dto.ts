import { IsInt, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  channelId: number;

  @IsString()
  content: string;
}
