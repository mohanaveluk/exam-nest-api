import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Group } from './group.entity';

@Entity('permissions_tbl')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column()
  description: string;

  @ManyToMany(() => Group)
  groups: Group[];
}