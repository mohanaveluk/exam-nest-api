import { IsString, IsEnum, IsNumber, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TE_CreateOptionDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

export class TE_CreateQuestionDto {
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

  @ApiProperty()
  @IsString()
  examId: string;

  @ApiProperty({ type: [TE_CreateOptionDto] })
  @ValidateNested({ each: true })
  @Type(() => TE_CreateOptionDto)
  options: TE_CreateOptionDto[];
}