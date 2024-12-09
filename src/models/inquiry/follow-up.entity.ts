import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { InquiryResponse } from './inquiry-response.entity';
import { User } from '../user.entity';

@Entity('inquiry_follow_up_tbl')
export class FollowUp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => InquiryResponse, response => response.followUps)
  response: InquiryResponse;

  @ManyToOne(() => User, user => user.followUps)
  user: User;

  @Column({
    type: 'enum',
    enum: ['pending', 'answered'],
    default: 'pending'
  })
  status: 'pending' | 'answered';

  @OneToMany(() => InquiryResponse, response => response.followUp)
  responses: InquiryResponse[];

  @CreateDateColumn()
  createdAt: Date;
}