import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exam } from './exam.entity';
import { Option } from './option.entity';
import { Exclude } from 'class-transformer';

@Entity('question_tbl')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'text'})
  question: string;

  @Column()
  type: string;

  @Column('simple-array', {name: 'correct_answers'})
  correctAnswers: number[];

  @Column({ name : 'is_deleted', default: false })
  isDeleted: boolean;

  @Column('simple-array', { nullable: true })
  order: number[];

  @ManyToOne(() => Exam, exam => exam.questions)
  @JoinColumn({ name: 'exam_id' })
  @Exclude()
  exam: Exam;

  @OneToMany(() => Option, option => option.question)
  options: Option[];
}