import { IsString, IsNumber, IsArray, ValidateNested, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum QuestionType {
  MULTIPLE = 'multiple',
  SINGLE = 'single',
  TRUE_FALSE = 'true-false',
  RANKING = 'ranking'
}

export class OptionDto {
  @ApiProperty({
    description: 'The text content of the option',
    example: 'Option A'
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class QuestionDto {
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

export class CreateExamDto {
  @ApiProperty({
    description: 'The title of the exam',
    example: 'NURSE CERTIFICATION EXAM'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the exam',
    example: 'To earn nurse certification'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category ID of the exam',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Additional notes about the exam',
    example: 'To earn nurse certification and it will have 55 questions'
  })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({
    description: 'Duration of the exam in minutes',
    example: 90
  })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Minimum score required to pass the exam',
    example: 70
  })
  @IsNumber()
  passingScore: number;

  @ApiProperty({
    description: 'Current status of the exam',
    example: 1   
  })
  @IsNumber()
  status: number;

  @ApiProperty({
    description: 'Array of questions in the exam',
    type: [QuestionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}