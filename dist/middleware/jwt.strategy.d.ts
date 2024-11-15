import { Strategy } from 'passport-jwt';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: any): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }>;
}
export {};
