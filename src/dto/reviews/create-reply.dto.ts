import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({
    description: 'ID of the review being replied to',
    example: 'uuid-string'
  })
  @IsString()
  reviewId: string;

  @ApiProperty({
    description: 'Reply comment',
    example: 'Thank you for your feedback'
  })
  @IsString()
  comment: string;
}