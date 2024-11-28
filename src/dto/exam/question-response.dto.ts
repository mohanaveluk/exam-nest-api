import { ApiProperty } from '@nestjs/swagger';
import { OptionResponseDto } from './option-response.dto';

export class QuestionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the question',
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
    description: 'Correct answer indices (only for admin view)',
    type: [Number],
    example: [0, 2]
  })
  correctAnswers?: number[];

  @ApiProperty({
    description: 'Order of options for ranking questions',
    type: [Number],
    example: [1, 2, 3, 4]
  })
  order?: number[];
  
}