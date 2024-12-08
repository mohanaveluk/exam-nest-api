import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity('review_reply_tbl')
export class ReviewReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Review, review => review.replies)
  review: Review;

  @Column()
  userId: string;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}