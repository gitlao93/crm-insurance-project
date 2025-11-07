import { IsInt } from 'class-validator';

export class CreateDmDto {
  @IsInt()
  withUserId: number;
}
