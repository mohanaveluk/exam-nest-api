import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { UpdatePasswordDto } from '../dto/auth/update-password.dto';
import { PasswordArchive } from '../models/password-archive.entity';
export declare class AuthService {
    private userRepository;
    private passwordArchiveRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, passwordArchiveRepository: Repository<PasswordArchive>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    }>;
    updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
