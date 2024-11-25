import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    description: 'Category of the exam',
    example: '2'
  })
  @IsString()
  @IsOptional()
  category?: string;

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
}