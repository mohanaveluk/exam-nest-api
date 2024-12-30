import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ example: 'uuid-1234', description: 'Unique identifier of the permission' })
  id: string;

  @ApiProperty({ example: 'exams', description: 'Resource name that the permission applies to' })
  resource: string;

  @ApiProperty({ example: 'view', description: 'Action allowed on the resource' })
  action: string;

  @ApiProperty({ example: 'View exams', description: 'Detailed description of the permission' })
  description: string;
}