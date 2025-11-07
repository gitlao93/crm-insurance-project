import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  link: string;

  @IsOptional()
  @IsString()
  message?: string;
}
