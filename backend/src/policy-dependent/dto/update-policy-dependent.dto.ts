import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyDependentDto } from './create-policy-dependent.dto';

export class UpdatePolicyDependentDto extends PartialType(
  CreatePolicyDependentDto,
) {}
