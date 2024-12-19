import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TE_Question } from './te-question.entity';

@Entity('te_option_tbl')
export class TE_Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  isCorrect?: boolean;

  @ManyToOne(() => TE_Question, question => question.options)
  question: TE_Question;
}