import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamController } from '../controllers/exam.controller';
import { ExamService } from '../services/exam.service';
import { Exam } from '../models/exam/exam.entity';
import { Question } from '../models/exam/question.entity';
import { Option } from '../models/exam/option.entity';
import { Category } from 'src/models/exam/category.entity';
import { CategoryController } from 'src/controllers/category.controller';
import { CategoryService } from 'src/services/category.service';
import { ExamSession } from 'src/models/exam/exam-session.entity';
import { UserAnswer } from 'src/models/exam/user-answer.entity';
import { ExamResult } from 'src/models/exam/exam-result.entity';
import { UserExamController } from 'src/controllers/user-exam.controller';
import { ExamReviewController } from 'src/controllers/exam-review.controller';
import { ExamReviewService } from 'src/services/exam-review.service';
import { Review } from 'src/models/reviews/review.entity';
import { ReviewReply } from 'src/models/reviews/review-reply.entity';
import { AuthModule } from './auth.module';
import { TE_ExamController } from 'src/controllers/te-exam.controller';
import { TE_QuestionController } from 'src/controllers/te-question.controller';
import { TE_ExamService } from 'src/services/te-exam.service';
import { TE_QuestionService } from 'src/services/te-question.service';
import { TE_Exam } from 'src/models/trial-exam/te-exam.entity';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { TE_Option } from 'src/models/trial-exam/te-option.entity';
import { TE_QuestionUpdateService } from 'src/services/te-question-update.service';
import { TE_OptionService } from 'src/services/te-option.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Exam,
    TE_Exam,
    TE_Question,
    TE_Option,
    Question,
    Option,
    Category,
    ExamSession,
    UserAnswer,
    ExamResult,
    Review,
    ReviewReply]),
    AuthModule
  ],
  controllers: [
    ExamController,
    TE_ExamController,
    CategoryController,
    UserExamController,
    ExamReviewController,
    TE_QuestionController
  ],
  providers: [
    ExamService,
    TE_ExamService,
    CategoryService,
    ExamReviewService,
    TE_QuestionService,
    TE_QuestionUpdateService,
    TE_OptionService
  ],
})
export class ExamModule { }