import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { PasswordArchive } from './password-archive.entity';
import { RoleEntity } from './roles.entity';
import { Inquiry } from './inquiry/inquiry.entity';
import { InquiryResponse } from './inquiry/inquiry-response.entity';
import { FollowUp } from './inquiry/follow-up.entity';
import { RefreshToken } from './user/refresh-token.entity';
import { Group } from './auth/group.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column({nullable: true})
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: false})
  password: string;

  @Column({nullable: true})
  mobile: string;

  @Column({nullable: true})
  major: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  verificationCodeExpiry: Date;
  
  @Column({ type: 'datetime' })
  created_at: Date
  
  @Column({ type: 'datetime', nullable: true })
  updated_at: Date
  
  @Column({ default: '1' })
  is_active: number
  
  @Column({nullable: false})
  uguid: string

  @ManyToOne(() => RoleEntity, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ nullable: true })
  role_id: number;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(() => PasswordArchive, passwordArchive => passwordArchive.user)
  password_history: PasswordArchive[];

  @OneToMany(() => Inquiry, inquiry => inquiry.user)
  inquiries: Inquiry[];

  @OneToMany(() => InquiryResponse, response => response.user)
  responses: InquiryResponse[];
  
  @OneToMany(() => FollowUp, followUp => followUp.user)
  followUps: FollowUp[];

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];

  @ManyToMany(() => Group)
  @JoinTable({
    name: 'user_groups_tbl',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    }
  })
  groups: Group[];
}