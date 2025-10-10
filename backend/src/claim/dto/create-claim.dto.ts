import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ClaimType } from 'src/policy-plan/policy-plan.entities';
import { ClaimStatus } from '../claim.entities';

export class CreateClaimDto {
  @IsNotEmpty()
  policyHolderId: number;

  @IsOptional()
  @IsObject()
  claimType: Partial<Record<ClaimType, number>>;

  @IsDateString()
  @IsOptional()
  dateFiled?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}
