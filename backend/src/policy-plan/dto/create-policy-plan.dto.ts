import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePolicyPlanDto {
  @IsString()
  @IsNotEmpty()
  planName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRate: number;

  @IsString()
  @IsOptional()
  currency?: string = 'PHP';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  coverageAmount?: number;

  @IsString()
  @IsOptional()
  status?: string = 'active';

  @Type(() => Number)
  @IsNumber()
  categoryId: number;
}
