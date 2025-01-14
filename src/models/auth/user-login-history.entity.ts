import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';


@Entity('user_login_history')
export class UserLoginHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  userGuid: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  loginTime: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  logoutTime: Date;

  @ApiProperty()
  @Column({ length: 50 })
  ipAddress: string;

  @ApiProperty()
  @Column({ length: 255, nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ 
    type: 'enum',
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  })
  deviceType: 'desktop' | 'mobile' | 'tablet';

  
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.loginHistory)
  user: User;

  @Column()
  userId: number;
}