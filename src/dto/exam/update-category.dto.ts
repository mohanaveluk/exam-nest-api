import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Updated name of the category',
    example: 'Advanced Medical Surgery'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the category',
    example: 'Advanced exams covering surgical procedures and practices'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'Active status', default: 1 })
  @IsOptional()
  @IsNumber()
  is_active?: number;
}