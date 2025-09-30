import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePolicyCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  agencyId: number;
}
