import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Permission } from './permission.entity';

//@Entity('group_permissions_tbl')
// export class GroupPermission {
//   @ManyToOne(() => Group, group => group.id) //group.groupPermissions
//   @JoinColumn({ name: 'group_id' })
//   group: Group;

//   @ManyToOne(() => Permission, permission => permission.groupPermissions)
//   @JoinColumn({ name: 'permission_id' })
//   permission: Permission;
// }