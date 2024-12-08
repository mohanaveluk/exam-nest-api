import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReplyDto } from 'src/dto/reviews/create-reply.dto';
import { CreateReviewDto } from 'src/dto/reviews/create-review.dto';
import { ExamRatingDto, ReviewResponseDto } from 'src/dto/reviews/review-response.dto';
import { Exam } from 'src/models/exam/exam.entity';
import { ReviewReply } from 'src/models/reviews/review-reply.entity';
import { Review } from 'src/models/reviews/review.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/models/user.entity';


@Injectable()
export class ExamReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewReply)
    private replyRepository: Repository<ReviewReply>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    // @InjectRepository(User)
    // private userRepository: Repository<User>,
    private userService: AuthService,

  ) {}

  async getReviewsByExam(examId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { exam: { id: examId } },
      relations: ['replies', 'exam'],
      order: { createdAt: 'DESC' },
    });

    const reviewsWithUserInfo = await Promise.all(
      reviews.map(async (review) => {
        const user = await this.userService.getUserInfo(review.userId);
        const repliesWithUserInfo = await Promise.all(
          review.replies.map(async (reply) => {
            const replyUser = await this.userService.getUserInfo(reply.userId);
            return {
              id: reply.id,
              comment: reply.comment,
              user: {
                id: replyUser.id.toString(),
                name: `${replyUser.first_name} ${replyUser.last_name}`,
                profileImage: replyUser.profileImage,
              },
              createdAt: reply.createdAt,
            };
          })
        );

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          sentiment: review.sentiment,
          user: {
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name}`,
            profileImage: user.profileImage,
            guid: user.uguid
          },
          replies: repliesWithUserInfo,
          createdAt: review.createdAt,
        };
      })
    );

    return reviewsWithUserInfo;
  }

  async getExamAverageRating(examId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.examId = :examId', { examId })
      .select('AVG(review.rating)', 'averageRating')
      .getRawOne();

    return Number(result.averageRating) || 0;
  }

  async getAllExamsRatings(): Promise<ExamRatingDto[]> {
    const results = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.exam', 'exam')
      .select([
        'exam.id as examId',
        'exam.title as examTitle',
        'AVG(review.rating) as averageRating',
        'COUNT(review.id) as totalReviews'
      ])
      .groupBy('exam.id')
      .getRawMany();

    return results.map(result => ({
      examId: result.examId,
      examTitle: result.examTitle,
      averageRating: Number(result.averageRating) || 0,
      totalReviews: Number(result.totalReviews) || 0
    }));
  }

  async createReview(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    const exam = await this.examRepository.findOne({
      where: { id: createReviewDto.examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const review = this.reviewRepository.create({
      exam,
      userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      sentiment: this.determineSentiment(createReviewDto.rating),
    });

    return this.reviewRepository.save(review);
  }

  async addReply(createReplyDto: CreateReplyDto, userId: string): Promise<ReviewReply> {
    const review = await this.reviewRepository.findOne({
      where: { id: createReplyDto.reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const reply = this.replyRepository.create({
      review,
      userId,
      comment: createReplyDto.comment,
    });

    return this.replyRepository.save(reply);
  }

  async updateReview(reviewId: string, userId: string, updateData: Partial<Review>): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or unauthorized');
    }

    if (updateData.rating) {
      updateData.sentiment = this.determineSentiment(updateData.rating);
    }

    Object.assign(review, updateData);
    return this.reviewRepository.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or unauthorized');
    }

    await this.reviewRepository.remove(review);
  }

  async deleteReply(replyId: string, userId: string): Promise<void> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId, userId },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found or unauthorized');
    }

    await this.replyRepository.remove(reply);
  }

  private determineSentiment(rating: number): 'positive' | 'negative' | 'neutral' {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    return 'neutral';
  }
}