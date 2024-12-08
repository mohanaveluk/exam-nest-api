import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'User\'s full name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'URL to user\'s profile image',
    example: 'https://example.com/profile.jpg'
  })
  profileImage: string;
}

export class ReviewReplyResponseDto {
  @ApiProperty({
    description: 'Reply ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Reply comment',
    example: 'Thank you for your feedback'
  })
  comment: string;

  @ApiProperty({
    description: 'User who wrote the reply',
    type: UserInfoDto
  })
  user: UserInfoDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-09-21T10:00:00Z'
  })
  createdAt: Date;
}

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Rating given to the exam (1-5)',
    example: 4
  })
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great exam with comprehensive coverage'
  })
  comment: string;

  @ApiProperty({
    description: 'Sentiment analysis result',
    enum: ['positive', 'negative', 'neutral'],
    example: 'positive'
  })
  sentiment: 'positive' | 'negative' | 'neutral';

  @ApiProperty({
    description: 'User who wrote the review',
    type: UserInfoDto
  })
  user: UserInfoDto;

  @ApiProperty({
    description: 'Replies to this review',
    type: [ReviewReplyResponseDto]
  })
  replies: ReviewReplyResponseDto[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-09-21T10:00:00Z'
  })
  createdAt: Date;
}

export class ExamRatingDto {
  @ApiProperty({
    description: 'Exam ID',
    example: 'uuid-string'
  })
  examId: string;

  @ApiProperty({
    description: 'Exam title',
    example: 'Medical Surgery Certification'
  })
  examTitle: string;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 25
  })
  totalReviews: number;
}