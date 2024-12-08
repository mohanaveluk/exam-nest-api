import { ApiProperty } from '@nestjs/swagger';

export class InquiryStatsDto {
  @ApiProperty({
    description: 'Number of inquiries created today',
    example: 5
  })
  today: number;

  @ApiProperty({
    description: 'Number of inquiries created this month',
    example: 25
  })
  thisMonth: number;

  @ApiProperty({
    description: 'Number of inquiries created last month',
    example: 30
  })
  lastMonth: number;

  @ApiProperty({
    description: 'Total number of inquiries',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Number of answered inquiries',
    example: 80
  })
  answered: number;

  @ApiProperty({
    description: 'Number of pending inquiries',
    example: 20
  })
  pending: number;
}