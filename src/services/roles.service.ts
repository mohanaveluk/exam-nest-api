import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from 'src/models/roles.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/auth/enums/role.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,
  ) {}

  async createInitialRoles() {
    const roles = Object.values(Role).map(key => ({ name: key, rguid: uuidv4() }));

    for (const role of roles) {
      const roleExists = await this.rolesRepository.findOne({ where: { name: role.name } });
      if (!roleExists) {
        await this.rolesRepository.save(role);
      }
    }
  }
}