import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';
import { InquiryResponse } from './inquiry-response.entity';
import { User } from '../user.entity';

@Entity('inquiry_tbl')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.inquiries)
  user: User;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'answered'],
    default: 'pending'
  })
  status: 'pending' | 'answered';


  @OneToMany(() => InquiryResponse, response => response.inquiry)
  responses: InquiryResponse[];
}