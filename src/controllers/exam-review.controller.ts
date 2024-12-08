import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { CreateReplyDto } from 'src/dto/reviews/create-reply.dto';
import { CreateReviewDto } from 'src/dto/reviews/create-review.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { ReviewReply } from 'src/models/reviews/review-reply.entity';
import { Review } from 'src/models/reviews/review.entity';
import { ExamReviewService } from 'src/services/exam-review.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ExamRatingDto, ReviewResponseDto } from 'src/dto/reviews/review-response.dto';


@ApiTags('Exam Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ExamReviewController {
  constructor(private readonly reviewService: ExamReviewService) {}

  @Get('exam/:examId')
  @ApiOperation({ summary: 'Get all reviews for an exam' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getReviewsByExam(@Param('examId') examId: string): Promise<ReviewResponseDto[]> {
    return this.reviewService.getReviewsByExam(examId);
  }

  @Get('exam/:examId/rating')
  @ApiOperation({ summary: 'Get average rating for an exam' })
  @ApiResponse({ 
    status: 200, 
    description: 'Average rating retrieved successfully',
    type: Number
  })
  async getExamAverageRating(@Param('examId') examId: string): Promise<number> {
    return this.reviewService.getExamAverageRating(examId);
  }

  @Get('ratings/all')
  @ApiOperation({ summary: 'Get average ratings for all exams' })
  @ApiResponse({ 
    status: 200, 
    description: 'All exam ratings retrieved successfully',
    type: [ExamRatingDto]
  })
  async getAllExamsRatings(): Promise<ExamRatingDto[]> {
    return this.reviewService.getAllExamsRatings();
  }
  
  @Post()
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @User('id') userId: any,
  ): Promise<Review> {
    const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
    return this.reviewService.createReview(createReviewDto, tempUserId);
  }

  @Post('reply')
  @ApiOperation({ summary: 'Add a reply to a review' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  async addReply(
    @Body() createReplyDto: CreateReplyDto,
    @User('id') userId: any,
  ): Promise<ReviewReply> {
    const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
    return this.reviewService.addReply(createReplyDto, tempUserId);
  }

  @Put(':reviewId')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @User('id') userId: any,
    @Body() updateData: Partial<Review>,
  ): Promise<Review> {
    const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
    return this.reviewService.updateReview(reviewId, tempUserId, updateData);
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @User('id') userId: any,
  ): Promise<void> {
    const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
    return this.reviewService.deleteReview(reviewId, tempUserId);
  }

  @Delete('reply/:replyId')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiResponse({ status: 200, description: 'Reply deleted successfully' })
  async deleteReply(
    @Param('replyId') replyId: string,
    @User('id') userId: any,
  ): Promise<void> {
    const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
    return this.reviewService.deleteReply(replyId, tempUserId);
  }
}