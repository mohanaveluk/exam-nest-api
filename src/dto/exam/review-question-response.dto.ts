import { ApiProperty } from '@nestjs/swagger';
import { OptionResponseDto } from './option-response.dto';

export class ReviewQuestionResponseDto {
  @ApiProperty({
    description: 'Question ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the normal range for adult blood pressure?'
  })
  question: string;

  @ApiProperty({
    description: 'Type of question',
    example: 'multiple'
  })
  type: string;

  @ApiProperty({
    description: 'List of options for the question',
    type: [OptionResponseDto]
  })
  options: OptionResponseDto[];

  @ApiProperty({
    description: 'Previously selected answers',
    type: [Number],
    example: [1, 3]
  })
  userAnswers: number[];

  @ApiProperty({
    description: 'Question number in the exam',
    example: 5
  })
  questionNumber: number;

  @ApiProperty({
    description: 'Question index in the answer table',
    example: 3
  })
  questionIndex: number;

  @ApiProperty({
    description: 'Total number of questions in the exam',
    example: 50
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Time remaining in seconds',
    example: 3600
  })
  timeRemaining: number;
}