import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from 'src/models/auth/group.entity';
import { User } from 'src/models/user.entity';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>
  ) {}

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { uguid: userId } });
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });

    if (!user || !group) {
      throw new NotFoundException('User or group not found');
    }

    if (!group.users.some(u => u.id === user.id)) {
      group.users.push(user);
      await this.groupRepository.save(group);
    }
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    group.users = group.users.filter(user => user.uguid !== userId);
    await this.groupRepository.save(group);
  }
}