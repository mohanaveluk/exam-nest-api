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

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, Option, Category])],
  controllers: [ExamController, CategoryController],
  providers: [ExamService, CategoryService],
})
export class ExamModule {}