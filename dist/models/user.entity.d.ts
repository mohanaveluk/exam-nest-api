import { PasswordArchive } from './password-archive.entity';
export declare class User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    mobile: string;
    major: string;
    created_at: Date;
    updated_at: Date;
    is_active: number;
    roleGuid: string;
    uguid: string;
    password_history: PasswordArchive[];
}
