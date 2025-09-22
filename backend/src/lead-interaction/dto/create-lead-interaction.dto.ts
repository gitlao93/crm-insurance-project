import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';
import {
  InteractionStatus,
  InteractionType,
} from '../lead-interaction.entities';

export class CreateLeadInteractionDto {
  @IsInt()
  leadId: number;

  @IsInt()
  agentId: number;

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsEnum(InteractionStatus)
  status: InteractionStatus;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  dueDate: Date;
}
