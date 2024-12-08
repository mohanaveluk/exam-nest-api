import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Exam } from '../exam/exam.entity';
import { ReviewReply } from './review-reply.entity';


@Entity('review_tbl')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Exam)
  exam: Exam;

  @Column()
  userId: string;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @Column({
    type: 'enum',
    enum: ['positive', 'negative', 'neutral'],
  })
  sentiment: 'positive' | 'negative' | 'neutral';

  @OneToMany(() => ReviewReply, reply => reply.review)
  replies: ReviewReply[];

  @CreateDateColumn()
  createdAt: Date;
}