import { IsEnum, IsOptional } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response-user.dto';

export enum MessageDeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export class UpdateMessageStatusDto {
  @IsEnum(MessageDeliveryStatus)
  status: MessageDeliveryStatus;

  @IsOptional()
  readAt?: Date;
}

export class MessageStatusResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  status: MessageDeliveryStatus;

  @Expose()
  readAt?: Date;
}
