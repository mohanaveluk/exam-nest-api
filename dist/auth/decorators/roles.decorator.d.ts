import { Role } from '../enums/role.enum';
export declare const ROLES_KEY = "roles";
export declare const AllowRoles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
