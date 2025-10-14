import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimType, PolicyTerm, PolicyType } from '../policy-plan.entities';

export class CreatePolicyPlanDto {
  @IsString()
  @IsNotEmpty()
  policyName: string;

  @IsEnum(PolicyType)
  @IsOptional()
  policyType?: PolicyType = PolicyType.LIFE;

  @IsEnum(PolicyTerm)
  @IsOptional()
  term?: PolicyTerm = PolicyTerm.MONTHLY;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  commission_rate: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  premium: number;

  @IsString()
  @IsOptional()
  status?: string = 'Active';

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject({ message: 'benefits must be a valid JSON object' })
  benefits: Record<ClaimType, number>;
}
