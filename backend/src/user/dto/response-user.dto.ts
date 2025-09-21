import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRole } from '../user.entities';
import { Agency } from 'src/agency/agency.entities';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  landlineNumber?: string;

  @Expose()
  officeHours?: string;

  @Expose()
  role: UserRole;

  @Expose()
  isActive: boolean;

  @Exclude()
  password: string;

  @Expose()
  agencyId: number;

  @Expose()
  @Type(() => Agency) // will serialize using Agency entity class
  agency: Agency;

  @Expose()
  supervisorId?: number;

  @Expose()
  @Transform(
    ({ value }: { value: { firstName: string; lastName: string } | null }) => {
      if (!value) return null;
      return `${value.firstName} ${value.lastName}`;
    },
  )
  supervisorName?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
