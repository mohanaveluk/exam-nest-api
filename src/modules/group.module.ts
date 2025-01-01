import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from 'src/controllers/group.controller';
import { PermissionController } from 'src/controllers/permission.controller';
import { Group } from 'src/models/auth/group.entity';
import { Permission } from 'src/models/auth/permission.entity';
import { User } from 'src/models/user.entity';
import { PermissionService } from 'src/services/auth/permission.service';
import { GroupService } from 'src/services/group.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([Group, Permission, User]) //, GroupPermission
    ],
    controllers: [GroupController, PermissionController],
    providers: [GroupService, PermissionService],
    exports: [GroupService, PermissionService]
  })
  export class GroupModule { }