import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.entity';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { UpdatePasswordDto } from '../dto/auth/update-password.dto';
import { PasswordArchive } from '../models/password-archive.entity';
import { v4 as uuidv4 } from 'uuid';
import { DateService } from './date.service';
import { RoleEntity } from 'src/models/roles.entity';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordArchive)
    private passwordArchiveRepository: Repository<PasswordArchive>,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,    
    private jwtService: JwtService,
    private dateService: DateService
  ) {}

  async register(registerDto: RegisterDto) {
    try {

      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exist');
      }

      let role = await this.rolesRepository.findOne({ where: { rguid: registerDto.role_id } });
      if (!role) {
        role = await this.rolesRepository.findOne({ where: { name: 'user' } });
        if (!role) {
          throw new Error('Default role not found');
        }
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        uguid: uuidv4(),
        role,
        role_id: role.id,
        created_at: new Date(await this.dateService.getCurrentDateTime()),

      });

      await this.userRepository.save(user);
      return { message: 'User registered successfully' };
    } catch (err) {
      throw err;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Oops, Invalid User Id.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Oops, Password is incorrect.');
    }

    const payload = { 
      sub: user.uguid, 
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      //role: user.role_guid
    };
    
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.uguid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        //role: user.role_guid
      }
    };
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Archive the current password
    const passwordArchive = this.passwordArchiveRepository.create({
      password: user.password,
      user_id: user.id,
      user: user
    });
    await this.passwordArchiveRepository.save(passwordArchive);

    // Update to new password
    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }
}