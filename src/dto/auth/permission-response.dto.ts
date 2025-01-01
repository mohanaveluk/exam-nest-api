import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the permission'
  })
  id: string;

  @ApiProperty({
    example: 'exams',
    description: 'Resource name that the permission applies to'
  })
  resource: string;

  @ApiProperty({
    example: 'view',
    description: 'Action allowed on the resource'
  })
  action: string;

  @ApiProperty({
    example: 'View exams',
    description: 'Detailed description of the permission'
  })
  description: string;
}