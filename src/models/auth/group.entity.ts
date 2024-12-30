import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../user.entity';
import { Permission } from './permission.entity';


@Entity('groups_tbl')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

//   @ManyToMany(() => Permission)
//   @JoinTable()
//   permissions: Permission[];

    @ManyToMany(() => Permission)
    @JoinTable({
        name: 'group_permissions_tbl',
        joinColumn: {
        name: 'group_id',
        referencedColumnName: 'id'
        },
        inverseJoinColumn: {
        name: 'permission_id',
        referencedColumnName: 'id'
        }
    })
    permissions: Permission[];
  

//   @ManyToMany(() => User)
//   @JoinTable()
//   users: User[];

    @ManyToMany(() => User)
    @JoinTable({
    name: 'user_groups_tbl',
    joinColumn: {
        name: 'group_id',
        referencedColumnName: 'id'
    },
    inverseJoinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
    }
    })
    users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}