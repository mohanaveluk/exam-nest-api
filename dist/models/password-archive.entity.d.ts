import { User } from './user.entity';
export declare class PasswordArchive {
    id: number;
    password: string;
    created_at: Date;
    user: User;
    user_id: number;
}
