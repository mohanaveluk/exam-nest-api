import { ApiProperty } from "@nestjs/swagger";

export class TE_ExamResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the exam',
        example: '123e4567-e89b-12d3-a456-426614174000'
      })
      id: string;
    
      @ApiProperty({
        description: 'Title of the exam',
        example: 'Trial NURSE CERTIFICATION EXAM'
      })
      title: string;
    
      @ApiProperty({
        description: 'Description of the exam',
        example: 'Trial Certification exam for registered nurses'
      })
      description: string;

      @ApiProperty({
        description: 'Subject of the exam',
        example: 'Trial exam for registered nurses'
      })
      subject: string;

      @ApiProperty({
        description: 'Minimum score required to pass',
        example: 70
      })
      passingScore: number;
    
      @ApiProperty({
        description: 'Total number of questions',
        example: 50
      })
      totalQuestions: number;

      @ApiProperty({
        description: 'Current status of the exam',
        example: 'active'
      })
      is_active: number;
}