import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/models/auth/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        resource: 'ASC',
        action: 'ASC'
      }
    });
  }
}