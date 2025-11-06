import { IsInt } from 'class-validator';

export class AddMemberDto {
  @IsInt()
  userId: number;
}
