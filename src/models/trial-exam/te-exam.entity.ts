import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TE_Question } from './te-question.entity';

@Entity('te_emam_tbl')
export class TE_Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  subject: string;

  @Column()
  totalQuestions: number;

  @Column()
  passingScore: number;

  @Column({ default: true })
  is_active: boolean;
  
  @OneToMany(() => TE_Question, question => question.exam)
  questions: TE_Question[];
}