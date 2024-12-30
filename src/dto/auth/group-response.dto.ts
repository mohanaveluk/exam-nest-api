import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from './permission.dto';

export class GroupResponseDto {
  @ApiProperty({ example: 'uuid-1234', description: 'Unique identifier of the group' })
  id: string;

  @ApiProperty({ example: 'Admin Group', description: 'Name of the group' })
  name: string;

  @ApiProperty({ example: 'Group for administrators', description: 'Description of the group' })
  description: string;

  @ApiProperty({ 
    type: [PermissionResponseDto], 
    description: 'List of permissions assigned to this group' 
  })
  permissions: PermissionResponseDto[];

  @ApiProperty({ example: '2024-01-20T12:00:00Z', description: 'Group creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T12:00:00Z', description: 'Group last update timestamp' })
  updatedAt: Date;
}