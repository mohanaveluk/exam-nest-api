import { ApiProperty } from '@nestjs/swagger';

export class ExamSessionDto {
  @ApiProperty({
    description: 'Current status of the exam session',
    enum: ['active', 'paused', 'completed'],
    example: 'active'
  })
  status: 'active' | 'paused' | 'completed';

  @ApiProperty({
    description: 'Current question index',
    example: 5
  })
  currentIndex: number;

  @ApiProperty({
    description: 'Timestamp when the exam was started',
    example: '2023-09-21T10:00:00Z'
  })
  startTime: Date;

  @ApiProperty({
    description: 'Timestamp when the exam will end',
    example: '2023-09-21T11:30:00Z'
  })
  endTime: Date;

  @ApiProperty({
    description: 'Timestamp when the exam was paused',
    example: '2023-09-21T10:30:00Z'
  })
  pausedAt?: Date;

  @ApiProperty({
    description: 'Total time spent in paused state (in milliseconds)',
    example: 600000
  })
  totalPausedTime: number;

  @ApiProperty({
    description: 'Record of answered questions and their selected answers',
    example: { '1': [0, 2], '2': [1] }
  })
  answeredQuestions: Record<string, number[]>;

  @ApiProperty({
    description: 'Order of questions in the exam',
    type: [String],
    example: ['1', '2', '3', '4', '5']
  })
  questionOrder: string[];

  
  /*@ApiProperty({
    description: 'Total questions for the exam',
    example: 60
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Total duration for the exam',
    example: 60
  })
  duration: number;*/
}