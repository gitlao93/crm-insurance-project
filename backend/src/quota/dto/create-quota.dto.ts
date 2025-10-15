import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateQuotaDto {
  @IsString()
  @IsNotEmpty()
  month: string;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsInt()
  targetPolicies: number;

  @IsInt()
  adminId: number;
}
