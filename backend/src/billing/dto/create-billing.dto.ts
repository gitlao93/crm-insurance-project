import {
  IsInt,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  Min,
} from 'class-validator';
import { BillingStatus } from '../billing.entities';

export class CreateBillingDto {
  @IsInt()
  soaId: number;

  @IsInt()
  installmentNumber: number;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsOptional()
  @IsEnum(BillingStatus)
  status?: BillingStatus;

  @IsOptional()
  @IsString()
  receiptNumber?: string;
}
