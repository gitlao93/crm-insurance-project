import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyCategoryDto } from './create-policy-category.dto';

export class UpdatePolicyCategoryDto extends PartialType(
  CreatePolicyCategoryDto,
) {}
