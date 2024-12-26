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
import { TokenService } from './token.service';
import { StorageService } from './storage.service';
import { UpdateProfileDto } from 'src/dto/auth/update-profile.dto';
import { OTC } from 'src/models/user/otc.entity';
import { ValidateOTCDto } from 'src/dto/auth/validate-otc.dto';
import { MobileLoginDto } from 'src/dto/auth/mobile-login.dto';
import { addMinutes } from 'date-fns';
import { ResetPasswordDto } from 'src/dto/auth/reset-password.dto';
import { passwordResetTemplate } from 'src/email/templates/password-reset.template';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordArchive)
    private passwordArchiveRepository: Repository<PasswordArchive>,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,   
    @InjectRepository(OTC)
    private otcRepository: Repository<OTC>, 
    private jwtService: JwtService,
    private dateService: DateService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private emailService: EmailService,
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

      const savedUser = await this.userRepository.save(user);
      const tokens = await this.tokenService.generateTokens(savedUser);

      //await this.userRepository.save(user);
      return { message: 'User registered successfully', ...tokens };
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if email is being updated and is unique
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateProfileDto.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Update user properties
      Object.assign(user, updateProfileDto);
      user.updated_at = new Date();

      await this.userRepository.save(user);
      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw error;
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

    /*const payload = { 
      sub: user.uguid, 
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };
    
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.uguid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      }      
   };*/

   return this.tokenService.generateTokens(user);

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

  async getUserInfo(userId: string){
    const user = await this.userRepository.findOne({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async logout(userId: number) {
    await this.tokenService.revokeAllUserRefreshTokens(userId);
    return { message: 'Logged out successfully' };
  }


  async uploadProfileImage(userId: number, file: Express.Multer.File): Promise<{ message: string; imageUrl: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const imageUrl = await this.storageService.uploadFile(file);
      
      user.profileImage = imageUrl;
      user.updated_at = new Date();
      await this.userRepository.save(user);

      return {
        message: 'Profile image uploaded successfully',
        imageUrl,
      };
    } catch (error) {
      throw error;
    }
  }


  

  private generateOTC(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendMobileOTC(mobile: string): Promise<{ message: string }> {
    try {
      // Deactivate any existing OTCs for this mobile
      await this.otcRepository.update(
        { mobile, is_active: 1 },
        { is_active: 0 }
      );

      const code = this.generateOTC();
      const otc = this.otcRepository.create({
        mobile,
        code,
        expiry_datetime: addMinutes(new Date(), 10), // 10 minutes expiry
      });

      await this.otcRepository.save(otc);

      // TODO: Integrate with SMS service
      console.log(`OTC for ${mobile}: ${code}`);

      return { message: 'OTC sent successfully' };
    } catch (error) {
      throw error;
    }
  }

  async validateOTC(validateOTCDto: ValidateOTCDto): Promise<{ access_token?: string; message: string }> {
    try {
      const otc = await this.otcRepository.findOne({
        where: {
          mobile: validateOTCDto.mobile,
          code: validateOTCDto.code,
          is_active: 1,
        },
      });

      if (!otc) {
        throw new BadRequestException('Invalid OTC');
      }

      if (new Date() > otc.expiry_datetime) {
        throw new BadRequestException('OTC has expired');
      }

      // Deactivate the OTC
      otc.is_active = 0;
      await this.otcRepository.save(otc);

      // Find or create user
      let user = await this.userRepository.findOne({
        where: { mobile: validateOTCDto.mobile },
      });

      if (!user) {
        user = this.userRepository.create({
          mobile: validateOTCDto.mobile,
          created_at: new Date(),
        });
        await this.userRepository.save(user);
      }

      // Generate JWT token
      const payload = { sub: user.id, mobile: user.mobile };
      return {
        access_token: this.jwtService.sign(payload),
        message: 'OTC validated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async loginWithMobile(mobileLoginDto: MobileLoginDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { mobile: mobileLoginDto.mobile },
      });

      if (!user) {
        throw new BadRequestException('Mobile number not registered');
      }

      return this.sendMobileOTC(mobileLoginDto.mobile);
    } catch (error) {
      throw error;
    }
  }

  private async generateResetToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'password_reset' };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
  
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
  
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive password reset instructions' };
      }
  
      const token = await this.generateResetToken(user.uguid);
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;
  
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: passwordResetTemplate(resetLink),
      });
  
      return { message: 'If your email is registered, you will receive password reset instructions' };
    } catch (error) {
      throw error;
    }
  }
  
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }
  
      const user = await this.userRepository.findOne({
        where: { uguid: payload.sub },
      });
  
      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }
  
      // Archive current password
      const passwordArchive = this.passwordArchiveRepository.create({
        password: user.password,
        user_id: user.id,
        user: user
      });
      await this.passwordArchiveRepository.save(passwordArchive);
  
      // Update password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      user.password = hashedPassword;
      user.updated_at = new Date();
      await this.userRepository.save(user);
  
      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }

}