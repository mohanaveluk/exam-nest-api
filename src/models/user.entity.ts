import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { PasswordArchive } from './password-archive.entity';
import { UserRole } from 'src/auth/enums/role.enum';
import { RoleEntity } from './roles.entity';

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

  @OneToMany(() => PasswordArchive, passwordArchive => passwordArchive.user)
  password_history: PasswordArchive[];
  
}