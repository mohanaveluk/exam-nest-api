import { IsString, IsNumber, IsOptional, IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionDto } from './create-exam.dto';
import { Type } from 'class-transformer';

export class UpdateExamDto {
  @ApiPropertyOptional({
    description: 'The title of the exam',
    example: 'UPDATED NURSE CERTIFICATION EXAM'
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the exam',
    example: 'Updated description for nurse certification'
  })
  @IsString()
  @IsOptional()
  description?: string;

  // @ApiPropertyOptional({
  //   description: 'Category of the exam',
  //   example: '2'
  // })
  // @IsString()
  // @IsOptional()
  // category?: string;
  
  @ApiProperty({
    description: 'Category ID of the exam',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the exam',
    example: 'Updated notes for the certification exam'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Duration of the exam in minutes',
    example: 120
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Minimum score required to pass the exam',
    example: 75
  })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiPropertyOptional({
    description: 'Current status of the exam',
    example: 1
  })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({
    description: 'Array of questions in the exam',
    type: [QuestionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}