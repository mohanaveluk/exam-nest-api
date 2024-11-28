import { ApiProperty } from '@nestjs/swagger';

export class OptionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the option',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Text content of the option',
    example: '120/80 mmHg'
  })
  text: string;
}