import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Question } from './question.entity';

@Entity('exam_tbl')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'text'})
  title: string;

  @Column({type: 'text'})
  description: string;

  @Column()
  category: string;

  @Column({type: 'text'})
  notes: string;

  @Column({name: 'created_at'})
  createdAt: Date;

  @Column()
  duration: number;

  @Column({name: 'passing_score'})
  passingScore: number;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column()
  status: number;

  @OneToMany(() => Question, question => question.exam)
  questions: Question[];
}