import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response-user.dto';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsInt()
  @IsNotEmpty()
  agencyId: number;

  @IsInt()
  @IsOptional()
  createdById?: number;
}

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}

export class ChannelResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  isPrivate: boolean;

  @Expose()
  isArchived: boolean;

  @Expose()
  agencyId: number;

  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
