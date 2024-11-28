import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Medical Surgery'
  })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Exams related to surgical procedures and practices'
  })
  description: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-09-20T12:00:00Z'
  })
  created_at: Date;
}