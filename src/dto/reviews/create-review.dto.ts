import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID of the exam being reviewed',
    example: 'uuid-string'
  })
  @IsString()
  examId: string;

  @ApiProperty({
    description: 'Rating given to the exam (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great exam with comprehensive coverage'
  })
  @IsString()
  comment: string;
}