import { ApiProperty } from '@nestjs/swagger';

export class ExamDetailsDto {
  @ApiProperty({
    description: 'ID of the exam',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the exam',
    example: 'Medical Surgery Certification'
  })
  title: string;

  @ApiProperty({
    description: 'Description of the exam',
    example: 'Comprehensive evaluation of medical surgery knowledge'
  })
  description: string;

  @ApiProperty({
    description: 'Duration of the exam in minutes',
    example: 120
  })
  duration: number;

  @ApiProperty({
    description: 'Passing score required',
    example: 70
  })
  passingScore: number;

  @ApiProperty({
    description: 'Status required',
    example: 1
  })
  status?: number;

  @ApiProperty({
    description: 'Category of the exam',
    example: {
      cguid: 'uuid-string',
      name: 'Medical Surgery',
      description: 'Surgery related examinations'
    }
  })
  category: {
    cguid: string;
    name: string;
    description: string;
  };
}


export class QuestionResultDto {
  @ApiProperty({
    description: 'ID of the question',
    example: 1
  })
  questionId: number;

  @ApiProperty({
    description: 'GUID of the question',
    example: 'd8ed5c77-659e-4f84-bd7a-dbad71b0c1b5'
  })
  qguid: string;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the normal range for adult blood pressure?'
  })
  question: string;

  @ApiProperty({
    description: 'Type of question',
    example: 'single'
  })
  type: string;

  @ApiProperty({
    description: 'Options selected by the user',
    type: [Number],
    example: [1]
  })
  selectedOptions: number[];

  @ApiProperty({
    description: 'Correct options for the question',
    type: [Number],
    example: [1]
  })
  correctOptions: number[];

  @ApiProperty({
    description: 'Whether the answer was correct',
    example: true
  })
  isCorrect: boolean;
}

export class ExamResultDto {
  @ApiProperty({
    description: 'ID of the exam session',
    example: 'uuid-string'
  })
  sessionId: string;

  @ApiProperty({
    description: 'Exam details',
    type: ExamDetailsDto
  })
  exam: ExamDetailsDto;

  @ApiProperty({
    description: 'Total number of questions',
    example: 50
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Number of correct answers',
    example: 45
  })
  correctAnswers: number;

  @ApiProperty({
    description: 'Percentage score achieved',
    example: 90
  })
  scorePercentage: number;

  @ApiProperty({
    description: 'Whether the exam was passed',
    example: true
  })
  passed: boolean;

  @ApiProperty({
    description: 'Detailed results for each question',
    type: [QuestionResultDto]
  })
  questions?: QuestionResultDto[];

  
  @ApiProperty({
    description: 'Date of the exam',
    example: ""
  })
  createdAt: Date;
}