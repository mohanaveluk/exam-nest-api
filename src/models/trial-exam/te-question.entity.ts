import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TE_Exam } from './te-exam.entity';
import { TE_Option } from './te-option.entity';

@Entity('te_question_tbl')
export class TE_Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  type: 'single' | 'multiple' | 'true-false';

  @Column({ nullable: true, default: 1 })
  maxSelections?: number;

  @Column()
  subject: string;

  @Column()
  explanation: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => TE_Exam, exam => exam.questions)
  exam: TE_Exam;

  @OneToMany(() => TE_Option, option => option.question, { cascade: true })
  options: TE_Option[];
}