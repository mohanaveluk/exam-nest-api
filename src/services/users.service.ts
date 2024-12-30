import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/models/auth/group.entity';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

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