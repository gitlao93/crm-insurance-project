import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../user.entities';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+(-[A-Za-z]+)*$/, {
    message: 'firstName can only contain letters and an optional hyphen',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+(-[A-Za-z]+)*$/, {
    message: 'lastName can only contain letters and an optional hyphen',
  })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'phoneNumber must be 11 digits and start with 09',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MinLength(7, { message: 'landlineNumber must be at least 7 digits' })
  @MaxLength(15, { message: 'landlineNumber must not exceed 15 digits' })
  @Matches(/^\d+$/, {
    message: 'landlineNumber must contain only digits',
  })
  landlineNumber?: string;

  @IsOptional()
  @IsString()
  officeHours?: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsOptional()
  role?: UserRole;

  @IsInt({ message: 'agencyId must be an integer' })
  agencyId: number;

  @IsOptional()
  @IsInt({ message: 'supervisorId must be an integer' })
  supervisorId?: number;
}
