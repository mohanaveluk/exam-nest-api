import { ApiProperty } from '@nestjs/swagger';
import { ExamResultDto } from './exam-result.dto';

export class CategoryResultsDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'uuid-string'
  })
  cguid: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Medical Surgery'
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Exams related to surgical procedures'
  })
  description: string;

  @ApiProperty({
    description: 'List of exam results in this category',
    type: [ExamResultDto]
  })
  results: ExamResultDto[];

  @ApiProperty({
    description: 'Average score for this category',
    example: 85.5
  })
  averageScore: number;

  @ApiProperty({
    description: 'Number of passed exams in this category',
    example: 3
  })
  passedCount: number;

  @ApiProperty({
    description: 'Number of failed exams in this category',
    example: 1
  })
  failedCount: number;
}

export class UserExamResultsDto {
  @ApiProperty({
    description: 'Results grouped by category',
    type: [CategoryResultsDto]
  })
  categories: CategoryResultsDto[];

  @ApiProperty({
    description: 'Overall average score across all categories',
    example: 82.5
  })
  overallAverageScore: number;

  @ApiProperty({
    description: 'Total number of exams taken',
    example: 12
  })
  totalExams: number;

  @ApiProperty({
    description: 'Total number of passed exams',
    example: 10
  })
  totalPassed: number;

  @ApiProperty({
    description: 'Total number of failed exams',
    example: 2
  })
  totalFailed: number;
}