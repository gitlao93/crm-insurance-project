import {
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsString,
} from 'class-validator';
import { PolicyTerm } from 'src/policy-plan/policy-plan.entities';

export class CreateSoaDto {
  @IsInt()
  policyHolderId: number;

  @IsInt()
  policyPlanId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(PolicyTerm)
  paymentTerm: PolicyTerm;

  @IsNumber()
  premiumPerTerm: number;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsNumber()
  totalPremium?: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  policyNumber: string;
}
