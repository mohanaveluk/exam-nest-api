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

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, Option, Category, ExamSession, UserAnswer, ExamResult])],
  controllers: [ExamController, CategoryController],
  providers: [ExamService, CategoryService],
})
export class ExamModule {}