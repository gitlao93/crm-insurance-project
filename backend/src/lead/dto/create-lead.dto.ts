import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { LeadStatus } from '../lead.entities';

export class CreateLeadDto {
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

  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsNotEmpty()
  agentId: number;

  @IsNotEmpty()
  agencyId: number;

  @IsNotEmpty()
  policyPlanId: number;
}
