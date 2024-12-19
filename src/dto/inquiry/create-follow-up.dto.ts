import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUpDto {
  @ApiProperty({
    description: 'Content of the follow-up question',
    example: 'Could you please clarify the part about medication dosage?'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID of the response this follow-up is related to',
    example: 'uuid-string'
  })
  @IsUUID()
  @IsNotEmpty()
  responseId: string;
}