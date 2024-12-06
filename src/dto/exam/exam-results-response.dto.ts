import { ApiProperty } from '@nestjs/swagger';
import { ExamResultDto } from './exam-result.dto';

export class ExamResultsResponseDto {
  @ApiProperty({
    description: 'List of exam results',
    type: [ExamResultDto]
  })
  results: ExamResultDto[];

  @ApiProperty({
    description: 'Total number of results',
    example: 10
  })
  total: number;

  @ApiProperty({
    description: 'Average score percentage',
    example: 85.5
  })
  averageScore: number;

  @ApiProperty({
    description: 'Number of passed attempts',
    example: 8
  })
  passedCount: number;

  @ApiProperty({
    description: 'Number of failed attempts',
    example: 2
  })
  failedCount: number;
}