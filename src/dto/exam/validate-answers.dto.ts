import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateAnswersDto {
  @ApiProperty({
    description: 'Array of selected answer indices',
    type: [Number],
    example: [0, 2]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  selectedAnswers: number[];
}