import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../user.entities';

export class SupervisorSummaryDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;
}

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
  supervisorId?: number;

  @Expose()
  @Type(() => SupervisorSummaryDto)
  supervisorName?: SupervisorSummaryDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
