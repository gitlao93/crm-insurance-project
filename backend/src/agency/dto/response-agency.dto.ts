import { Expose, Type } from 'class-transformer';
import { UserRole } from 'src/user/user.entities';

export class AgencyUserSummaryDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;
}

export class AgencyResponseDto {
  @Expose()
  id: number;

  @Expose()
  agencyName: string;

  @Expose()
  street: string;

  @Expose()
  cityMunicipality: string;

  @Expose()
  postalCode: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  landLine?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => AgencyUserSummaryDto)
  users?: AgencyUserSummaryDto[];
}
