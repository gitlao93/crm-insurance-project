import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePolicyDependentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsNumber()
  policyHolderId: number;
}
