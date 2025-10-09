import { IsInt } from 'class-validator';

export class CreateCommissionDto {
  @IsInt()
  billingId: number;

  @IsInt()
  soaId: number;

  @IsInt()
  policyPlanId: number;

  @IsInt()
  policyHolderId: number;

  @IsInt()
  agentId: number;

  @IsInt()
  amount: number;
}
