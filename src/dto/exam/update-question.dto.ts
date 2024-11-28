import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from './create-exam.dto';

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'The question text',
    example: 'Updated: What is the normal range for adult blood pressure?'
  })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({
    description: 'The type of question',
    enum: QuestionType,
    example: QuestionType.SINGLE
  })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({
    description: 'Array of options for the question',
    type: [String],
    example: ['120/80 mmHg', '140/90 mmHg', '110/70 mmHg', '130/85 mmHg']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    description: 'Array of correct answer indices',
    type: [Number],
    example: [0]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  correctAnswers?: number[];

  @ApiPropertyOptional({
    description: 'Array for ordering questions (used in ranking type)',
    type: [Number],
    example: [1, 2, 3, 4, 5]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  order?: number[];


  @ApiProperty({
    description: 'The unique uuid text',
    example: '37035365c1794859b7dce39e64025c53'
  })
  @IsString()
  qguid: string
}