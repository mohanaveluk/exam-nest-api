import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamController } from '../controllers/exam.controller';
import { ExamService } from '../services/exam.service';
import { Exam } from '../models/exam/exam.entity';
import { Question } from '../models/exam/question.entity';
import { Option } from '../models/exam/option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, Option])],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}