import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PolicyHolderStatus } from '../policy-holder.entities';

export class CreatePolicyHolderDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+([ -][A-Za-z]+)*$/, {
    message: 'firstName can only contain letters and an optional hyphen',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+([ -][A-Za-z]+)*$/, {
    message: 'firstName can only contain letters and an optional hyphen',
  })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{9}$/, {
    message: 'phoneNumber must be 11 digits and start with 09',
  })
  phoneNumber: string;

  @IsEnum(PolicyHolderStatus)
  status: PolicyHolderStatus;

  @IsNotEmpty()
  agentId: number;

  @IsNotEmpty()
  agencyId: number;

  @IsNotEmpty()
  policyPlanId: number;

  @IsOptional()
  leadId?: number;

  @IsNotEmpty()
  @IsDateString()
  StartDate: Date;

  @IsNotEmpty()
  @IsDateString()
  EndDate: Date;

  @IsNotEmpty()
  @IsDateString()
  dueDate: Date;
}
