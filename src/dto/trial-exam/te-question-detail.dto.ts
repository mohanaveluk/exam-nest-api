import { ApiProperty } from '@nestjs/swagger';

export class TE_OptionDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;
}

export class TE_QuestionDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: ['single', 'multiple', 'true-false'] })
  type: 'single' | 'multiple' | 'true-false';

  @ApiProperty({ required: false })
  maxSelections?: number;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  explanation: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty({ type: [TE_OptionDetailDto] })
  options: TE_OptionDetailDto[];
}