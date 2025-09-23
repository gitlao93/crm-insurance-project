import { IsEnum, IsInt } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response-user.dto';
import { ChannelRole } from '../entities/channel-member.entity';

export class AddChannelMemberDto {
  @IsInt()
  channelId: number;

  @IsInt()
  userId: number;

  @IsEnum(ChannelRole)
  role: ChannelRole;
}

export class UpdateChannelMemberDto {
  @IsEnum(ChannelRole)
  role: ChannelRole;
}

export class ChannelMemberResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  role: ChannelRole;

  @Expose()
  joinedAt: Date;
}
