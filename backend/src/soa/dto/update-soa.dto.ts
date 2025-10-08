import { PartialType } from '@nestjs/mapped-types';
import { CreateSoaDto } from './create-soa.dto';

export class UpdateSoaDto extends PartialType(CreateSoaDto) {}
