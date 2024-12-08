import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDto {
  @ApiProperty({
    description: 'Content of the response',
    example: 'The human heart is a muscular organ divided into four chambers...'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}