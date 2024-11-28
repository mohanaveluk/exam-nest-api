import { ApiProperty } from '@nestjs/swagger';
import { QuestionResponseDto } from './question-response.dto';
import { Category } from 'src/models/exam/category.entity';

export class ExamResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the exam',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the exam',
    example: 'NURSE CERTIFICATION EXAM'
  })
  title: string;

  @ApiProperty({
    description: 'Description of the exam',
    example: 'Certification exam for registered nurses'
  })
  description: string;

  @ApiProperty({
    description: 'Category of the exam',
    example: '1'
  })
  category: Category;

  @ApiProperty({
    description: 'Additional notes about the exam',
    example: 'Please review all materials before starting'
  })
  notes: string;

  @ApiProperty({
    description: 'Duration of the exam in minutes',
    example: 90
  })
  duration: number;

  @ApiProperty({
    description: 'Minimum score required to pass',
    example: 70
  })
  passingScore: number;

  @ApiProperty({
    description: 'Total number of questions',
    example: 50
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Current status of the exam',
    example: 'active'
  })
  status: number;

  @ApiProperty({
    description: 'List of questions in the exam',
    type: [QuestionResponseDto]
  })
  questions?: QuestionResponseDto[];
}