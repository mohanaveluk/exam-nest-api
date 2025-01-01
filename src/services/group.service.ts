import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupDto, UpdateGroupDto } from 'src/dto/auth/group.dto';
import { Group } from 'src/models/auth/group.entity';
import { Permission } from 'src/models/auth/permission.entity';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    // First, fetch all permissions if they are provided
    let permissions: Permission[] = [];
    if (createGroupDto.permissions && createGroupDto.permissions.length > 0) {
      permissions = await this.permissionRepository.findByIds(
        createGroupDto.permissions.map(p => p.id)
      );

      if (permissions.length !== createGroupDto.permissions.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    // Create the group with the fetched permissions
    const group = this.groupRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      permissions: permissions
    });

    return this.groupRepository.save(group);
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async delete(id: string): Promise<void> {
    const result = await this.groupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  async findAllWithUsers(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['users', 'permissions'],
      order: {
        name: 'ASC'
      }
    });
  }
  
  async findAllWithPermissions(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['permissions'],
      order: {
        name: 'ASC',
        createdAt: 'DESC'
      }
    });
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });
    const user = await this.userRepository.findOne({ where: { uguid: userId } });

    if (!group || !user) {
      throw new NotFoundException('Group or user not found');
    }

    group.users.push(user);
    await this.groupRepository.save(group);
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    group.users = group.users.filter(user => user.uguid !== userId);
    await this.groupRepository.save(group);
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const user = await this.userRepository.findOne({
      where: { uguid: userId },
      relations: ['groups', 'groups.permissions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.groups;
  }
}