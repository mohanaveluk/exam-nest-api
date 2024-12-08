import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({
    description: 'Subject of the inquiry',
    example: 'Question about Anatomy'
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Content of the inquiry',
    example: 'Can you explain the structure of the human heart in detail?'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}