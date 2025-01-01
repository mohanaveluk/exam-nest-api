import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { Group } from './group.entity';
//import { GroupPermission } from './group-permission.entity';

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

  @ManyToMany(() => Group, group => group.permissions)
  @JoinTable({
    name: 'group_permissions_tbl',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    }
  })
  groups: Group[];
  
  //@ManyToMany(() => Group)
  //groups: Group[];
  // @OneToMany(() => GroupPermission, groupPermission => groupPermission.permission)
  // groupPermissions: GroupPermission[];  
}