import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateAgencyDto {
  @IsString()
  @Length(2, 255)
  agencyName: string;

  @IsString()
  @Length(2, 255)
  street: string;

  @IsString()
  @Length(2, 255)
  cityMunicipality: string;

  @IsString()
  @Length(4, 10)
  @Matches(/^\d+$/, { message: 'postalCode must contain only numbers' })
  postalCode: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @Matches(/^09\d{9}$/, {
    message: 'phoneNumber must be 11 digits and start with 09',
  })
  phoneNumber?: string;

  @IsOptional()
  @Matches(/^\d{7,15}$/, {
    message: 'landLine must be 7 to 15 digits',
  })
  landLine?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
