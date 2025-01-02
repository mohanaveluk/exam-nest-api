import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TE_Question } from './te-question.entity';

@Entity('te_exam_tbl')
export class TE_Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({type: "text"})
  description: string;

  @Column()
  subject: string;

  @Column()
  totalQuestions: number;

  @Column()
  passingScore: number;

  @Column({ default: true })
  is_active: boolean;
  
  @Column({name: 'created_at'})
  createdAt: Date;

  @Column({name: 'updated_at', nullable: true})
  updatedAt: Date;

  @OneToMany(() => TE_Question, question => question.exam)
  questions: TE_Question[];
}