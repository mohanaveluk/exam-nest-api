import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateAnswersDto {
  @ApiProperty({
    description: 'Array of selected answer indices',
    type: [Number],
    example: [0, 2],
    nullable: true // This makes it clear in the API documentation that the property can be null
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  selectedAnswers: number[] | null;
}