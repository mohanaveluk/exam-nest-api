import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { GroupPermission } from 'src/models/auth/group-permission.entity';
//import { Group } from 'src/models/auth/group.entity';
import { Permission } from 'src/models/auth/permission.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    // @InjectRepository(GroupPermission)
    // private groupPermissionRepository: Repository<GroupPermission>,
    private dataSource: DataSource

  ) {}

  async createMultiple(
    resource: string,
    actions: string[],
    descriptions: string[]
  ): Promise<Permission[]> {
    const permissions = actions.map((action, index) => {
      return this.permissionRepository.create({
        resource,
        action,
        description: descriptions[index]
      });
    });

    return await this.permissionRepository.save(permissions);
  }

  async updateByResource(
    resource: string,
    actions?: string[],
    descriptions?: string[]
  ): Promise<Permission[]> {
    const existingPermissions = await this.permissionRepository.find({
      where: { resource }
    });

    if (!existingPermissions.length) {
      throw new NotFoundException(`No permissions found for resource: ${resource}`);
    }

    if (!actions || !descriptions) {
      return existingPermissions;
    }

    // Remove existing permissions for the resource
    //await this.permissionRepository.remove(existingPermissions);
    // Instead of removing, we'll delete using query builder
    /*await this.permissionRepository
      .createQueryBuilder()
      .delete()
      .from(Permission)
      .where("resource = :resource", { resource })
      .execute();*/

    // Get existing actions for this resource
    const existingActions = existingPermissions.map(p => p.action);

    // Find new actions to be added
    const newActions = actions.filter(action => !existingActions.includes(action));

     // Create new permissions for new actions
     const newPermissions = newActions.map((action, index) => {
      const actionIndex = actions.indexOf(action);
      return this.permissionRepository.create({
        resource,
        action,
        description: descriptions[actionIndex]
      });
    });

    // Update descriptions for existing permissions
    const updatedExistingPermissions = await Promise.all(
      existingPermissions.map(async permission => {
        const actionIndex = actions.indexOf(permission.action);
        if (actionIndex !== -1) {
          permission.description = descriptions[actionIndex];
          return await this.permissionRepository.save(permission);
        }
        return permission;
      })
    );

    // Save new permissions
    const savedNewPermissions = newPermissions.length > 0 
      ? await this.permissionRepository.save(newPermissions)
      : [];

    return [...updatedExistingPermissions, ...savedNewPermissions];

    //return await this.permissionRepository.save(newPermissions);
  }
  
  /*async updateByResource(
    resource: string,
    actions?: string[],
    descriptions?: string[]
  ): Promise<Permission[]> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get existing permissions
      const existingPermissions = await this.permissionRepository.find({
        where: { resource },
        relations: ['groups']
      });

      if (!existingPermissions.length) {
        throw new NotFoundException(`No permissions found for resource: ${resource}`);
      }

      if (!actions || !descriptions) {
        return existingPermissions;
      }

      // Store group associations before deleting permissions
      const permissionGroupMap = new Map<string, Group[]>();
      existingPermissions.forEach(permission => {
        permissionGroupMap.set(permission.id, permission.groups);
      });

      // Delete existing permissions and their relationships
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('group_permissions_tbl')
        .where("permission_id IN (:...ids)", { 
          ids: existingPermissions.map(p => p.id) 
        })
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Permission)
        .where("resource = :resource", { resource })
        .execute();

      // Create new permissions
      const newPermissions = actions.map((action, index) => {
        return this.permissionRepository.create({
          resource,
          action,
          description: descriptions[index]
        });
      });

      // Save new permissions
      const savedPermissions = await queryRunner.manager.save(Permission, newPermissions);

      // Restore group associations for new permissions
      const groupUpdatePromises = savedPermissions.map(async (newPermission, index) => {
        const oldPermissionId = existingPermissions[index]?.id;
        if (oldPermissionId && permissionGroupMap.has(oldPermissionId)) {
          const groups = permissionGroupMap.get(oldPermissionId);
          if (groups && groups.length > 0) {
            // Create new relationships in group_permissions_tbl
            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into('group_permissions_tbl')
              .values(
                groups.map(group => ({
                  group_id: group.id,
                  permission_id: newPermission.id
                }))
              )
              .execute();
          }
        }
      });

      await Promise.all(groupUpdatePromises);
      await queryRunner.commitTransaction();

      // Return permissions with their group associations
      return this.permissionRepository.find({
        where: { resource },
        relations: ['groups']
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }*/
  
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        resource: 'ASC',
        action: 'ASC'
      }
    });
  }

  /*async findByResource1(resource: string): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.groupPermissions', 'groupPermission')
      .leftJoinAndSelect('groupPermission.group', 'group')
      .where('permission.resource = :resource', { resource })
      .getMany();
  }*/
  
  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
      order: {
        action: 'ASC'
      }
    });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id }
    });
  }

  async remove(id: string): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  async canDeletePermission(id: string): Promise<boolean> {
    // const permission = await this.permissionRepository
    //   .createQueryBuilder('permission')
    //   .leftJoin('permission.groups', 'group')
    //   .where('permission.id = :id', { id })
    //   .getOne();

    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['groups']
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // Check if permission is referenced in group_permissions
    const groupPermissionCount = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.groups', 'group')
      .where('permission.id = :id', { id })
      .getCount();

    return groupPermissionCount === 0;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    await this.permissionRepository.remove(permission);
  }

}