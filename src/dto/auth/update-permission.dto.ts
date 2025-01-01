import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    example: 'create, edit, view',
    description: 'Comma-separated list of actions',
    required: false
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_, -]+$/, {
    message: 'Actions should be comma-separated values containing only letters, numbers, and hyphens'
  })
  actions?: string;

  @ApiProperty({
    example: 'Create user, Edit user, View user',
    description: 'Comma-separated list of descriptions matching the actions',
    required: false
  })
  @IsString()
  @IsOptional()
  descriptions?: string;
}