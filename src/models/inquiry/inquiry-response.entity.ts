import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Inquiry } from './inquiry.entity';
import { User } from '../user.entity';

@Entity('inquiry_response_tbl')
export class InquiryResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inquiry, inquiry => inquiry.responses)
  inquiry: Inquiry;

  @ManyToOne(() => User, user => user.responses)
  user: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

}