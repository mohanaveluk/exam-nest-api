import { ApiProperty } from '@nestjs/swagger';

export class AnswerResponseDto {
  @ApiProperty({
    description: 'ID of the answer',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Selected options for the answer',
    type: [Number],
    example: [0, 2]
  })
  selectedOptions: number[];

  @ApiProperty({
    description: 'Index of the question in the exam',
    example: 0
  })
  questionIndex: number;

  @ApiProperty({
    description: 'Timestamp when the answer was submitted',
    example: '2023-09-21T10:00:00Z'
  })
  createdAt: Date;
}