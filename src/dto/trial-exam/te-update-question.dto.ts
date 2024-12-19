import { IsString, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TE_CreateOptionDto } from './te-create-question.dto';

export class TE_UpdateQuestionDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ enum: ['single', 'multiple', 'true-false'] })
  @IsEnum(['single', 'multiple', 'true-false'])
  type: 'single' | 'multiple' | 'true-false';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxSelections?: number;

  @ApiProperty()
  @IsString()
  subject: string;
  
  @ApiProperty()
  @IsString()
  explanation: string;

  @ApiProperty({ type: [TE_CreateOptionDto] })
  @ValidateNested({ each: true })
  @Type(() => TE_CreateOptionDto)
  options: TE_CreateOptionDto[];
}