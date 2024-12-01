import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exam } from './exam.entity';

@Entity('exam_session_tbl')
export class ExamSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @Column()
  currentIndex: number;

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  })
  status: 'active' | 'paused' | 'completed';

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ nullable: true })
  pausedAt: Date;

  @Column({ default: 0 })
  totalPausedTime: number;

  @Column('simple-array')
  questionOrder: string[];
  
  @Column('json', { nullable: true })
  answeredQuestions: Record<string, number[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}