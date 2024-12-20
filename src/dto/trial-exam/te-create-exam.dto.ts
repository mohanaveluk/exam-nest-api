import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TE_CreateExamDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalQuestions: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  passingScore: number;
}

export class TE_CreateExam{
  @ApiProperty({ required: false })
  exam: TE_CreateExamDto
  
  @ApiProperty({ required: false })
  questions: any[]
  
}