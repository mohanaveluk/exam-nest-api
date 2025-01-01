import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'users',
    description: 'The resource name for the permission'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Resource name can only contain letters, numbers, hyphens and underscores'
  })
  resource: string;

  @ApiProperty({
    example: 'create, edit, view',
    description: 'Comma-separated list of actions'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_, -]+$/, {
    message: 'Actions should be comma-separated values containing only letters, numbers, and hyphens'
  })
  actions: string;

  @ApiProperty({
    example: 'Create user, Edit user, View user',
    description: 'Comma-separated list of descriptions matching the actions'
  })
  @IsString()
  @IsNotEmpty()
  descriptions: string;
}