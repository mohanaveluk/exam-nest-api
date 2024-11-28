import { IsString, IsArray, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from './create-exam.dto';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'What is the normal range for adult blood pressure?'
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The type of question',
    enum: QuestionType,
    example: QuestionType.SINGLE
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'Array of options for the question',
    type: [String],
    example: ['120/80 mmHg', '140/90 mmHg', '110/70 mmHg', '130/85 mmHg']
  })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Array of correct answer indices',
    type: [Number],
    example: [0]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  correctAnswers: number[];

  @ApiProperty({
    description: 'Array for ordering questions (used in ranking type)',
    type: [Number],
    example: [1, 2, 3, 4, 5]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  order: number[];
}