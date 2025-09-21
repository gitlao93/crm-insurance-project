import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response-user.dto';

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
  @Type(() => UserResponseDto)
  users?: UserResponseDto[];
}
