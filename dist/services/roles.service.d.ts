import { RoleEntity } from 'src/models/roles.entity';
import { Repository } from 'typeorm';
export declare class RolesService {
    private rolesRepository;
    constructor(rolesRepository: Repository<RoleEntity>);
    createInitialRoles(): Promise<void>;
}
