import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Exam } from './exam.entity';
import { ExamSession } from './exam-session.entity';

@Entity('exam_result_tbl')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @ManyToOne(() => ExamSession)
  session: ExamSession;

  @Column()
  userId: string;

  @Column()
  totalQuestions: number;

  @Column()
  correctAnswers: number;

  @Column('decimal', { precision: 5, scale: 2 })
  scorePercentage: number;

  @Column()
  passed: boolean;

  @Column('json')
  questionResults: any;

  @CreateDateColumn()
  createdAt: Date;
}