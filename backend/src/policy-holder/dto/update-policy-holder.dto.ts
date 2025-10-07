import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyHolderDto } from './create-policy-holder.dto';

export class UpdatePolicyHolderDto extends PartialType(CreatePolicyHolderDto) {}
