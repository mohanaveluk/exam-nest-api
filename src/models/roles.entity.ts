import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false, length: 100})
  name: string;

  @Column({nullable: false,  length: 100})
  rguid: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}