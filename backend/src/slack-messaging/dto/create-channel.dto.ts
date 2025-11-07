import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType = ChannelType.PUBLIC;

  @IsOptional()
  @IsBoolean()
  isDirect?: boolean = false;
}
