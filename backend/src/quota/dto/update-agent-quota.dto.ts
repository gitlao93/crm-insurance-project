import { IsInt, IsOptional, IsNumber } from 'class-validator';

export class UpdateAgentQuotaDto {
  @IsOptional()
  @IsInt()
  achievedPolicies?: number;

  @IsOptional()
  @IsNumber()
  achievementRate?: number;
}
