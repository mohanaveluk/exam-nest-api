import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Inquiry } from './inquiry.entity';
import { User } from '../user.entity';
import { FollowUp } from './follow-up.entity';

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
  
  @OneToMany(() => FollowUp, followUp => followUp.response)
  followUps: FollowUp[];

  @ManyToOne(() => FollowUp, followUp => followUp.responses, { nullable: true })
  followUp: FollowUp;

}