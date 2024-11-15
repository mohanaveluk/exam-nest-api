import { OnModuleInit } from '@nestjs/common';
import { RolesService } from './services/roles.service';
export declare class AppModule implements OnModuleInit {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    onModuleInit(): Promise<void>;
}
