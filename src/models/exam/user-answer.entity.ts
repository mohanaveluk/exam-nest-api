import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Exam } from './exam.entity';
import { Question } from './question.entity';

@Entity('user_answer_tbl')
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @ManyToOne(() => Question)
  question: Question;

  @Column()
  questionIndex: number;

  @Column('simple-array')
  selectedOptions: number[];

  @CreateDateColumn()
  createdAt: Date;
}