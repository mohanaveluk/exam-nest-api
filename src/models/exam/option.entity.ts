import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { Exclude } from 'class-transformer';

@Entity('option_tbl')
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => Question, question => question.options)
  @JoinColumn({ name: 'question_id' })
  @Exclude()
  question: Question;
}