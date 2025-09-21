import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyPlanDto } from './create-policy-plan.dto';

export class UpdatePolicyPlanDto extends PartialType(CreatePolicyPlanDto) {}
