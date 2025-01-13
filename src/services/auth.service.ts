import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
import { verifyEmailTemplate } from 'src/email/templates/verify-email-template';
import { VerifyEmailDto } from 'src/dto/auth/verify-email.dto';
import { CommonService } from './common.service';
import { ResendOTCDto } from 'src/dto/auth/resend-otc.dto';
import { Permission } from 'src/models/auth/permission.entity';
import { UserResponseDto } from 'src/dto/auth/user-response.dto';
import { UpdateUserDto } from 'src/dto/auth/update-user.dto';

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
    private commonService: CommonService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {

      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email, isEmailVerified: true },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exist');
      }

      const unverifiedUser = await this.userRepository.findOne({
        where: { email: registerDto.email, isEmailVerified: false },
      });

      let role = await this.rolesRepository.findOne({ where: { rguid: registerDto.role_id } });
      if (!role) {
        role = await this.rolesRepository.findOne({ where: { name: 'user' } });
        if (!role) {
          throw new Error('Default role not found');
        }
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      if(unverifiedUser){
        // Update user properties
        Object.assign(unverifiedUser, registerDto);
        unverifiedUser.password = hashedPassword;
        unverifiedUser.updated_at = new Date();
        unverifiedUser.verificationCode = verificationCode;
        unverifiedUser.verificationCodeExpiry = verificationCodeExpiry;
        unverifiedUser.isEmailVerified = false;
        unverifiedUser.is_active = 0;
      }

      const user = unverifiedUser ? unverifiedUser : (this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        uguid: uuidv4(),
        role,
        role_id: role.id,
        created_at: new Date(await this.dateService.getCurrentDateTime()),
        verificationCode,
        verificationCodeExpiry,
        isEmailVerified: false,
        is_active: 0
      }));

      const savedUser = await this.userRepository.save(user);
      const tokens = await this.tokenService.generateTokens(savedUser);

      // Send verification email
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });


      //await this.userRepository.save(user);
      return { message: 'User registered successfully. Please check your email for verification code.' };
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

      if(!this.commonService.isNullOrEmpty(updateProfileDto.password)){
        const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
        updateProfileDto.password = hashedPassword;
      }

      // Update user properties
      Object.assign(user, updateProfileDto);
      user.updated_at = new Date();

      await this.userRepository.save(user);
      return { message: 'Profile updated successfully', profileImage: user.profileImage };
    } catch (error) {
      throw error;
    }
  }

  
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email }
    });

    if (!user) {
      throw new BadRequestException('Invalid email address');
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    if (!user.verificationCode || 
        user.verificationCode !== verifyEmailDto.code ||
        new Date() > user.verificationCodeExpiry) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.is_active = 1;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users =  await this.userRepository.find({
        where: { is_active: 1, isEmailVerified: true },
    });

    let userResponses = [];
    users.forEach(user => {
      const detail = {
        uguid: user.uguid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        major: user.major,
        mobile: user.mobile,
        profileImage: user.profileImage
      };
      userResponses.push(detail);
    });
    return userResponses;
  }
  
  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Oops, Invalid User Id.');
    }

    if (!user.isEmailVerified) {
      // Generate new verification code if needed
      if (!user.verificationCode || new Date() > user.verificationCodeExpiry) {
        const verificationCode = this.generateOTC();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
        
        user.verificationCode = verificationCode;
        user.verificationCodeExpiry = verificationCodeExpiry;
        await this.userRepository.save(user);
        
        // Send verification email
        await this.emailService.sendEmail({
          to: user.email,
          subject: 'Verify Your Email Address',
          html: verifyEmailTemplate(verificationCode),
        });
      }

      throw new UnauthorizedException('Please verify your email address. A verification code has been sent to your email.');
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

    user.password = "";
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

  async resendVerificationCode(resendOTCDto: ResendOTCDto): Promise<{ message: string }>{
    try {
      const user = await this.userRepository.findOne({
        where: { email: resendOTCDto.email },
      });

      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive verification code' };
      }
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = verificationCodeExpiry;
      await this.userRepository.save(user);
      
      // Send verification email
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });

      return { message: 'The verification code has been sent again. Please check your email for verification code' };

    } catch (error) {
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {

      const userEntity = await this.userRepository.findOne({
        where: { uguid: userId },
      });

      const user = await this.userRepository.findOne({
        where: { uguid: userId },
        relations: ['groups', 'groups.permissions'] //, 'groups.permissions'
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Collect unique permissions from all user groups
      const permissions = new Set<Permission>();
      user.groups.forEach(group => {
        group.permissions.forEach(permission => {
          permissions.add(permission);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      console.log(error);
      throw error;
    }

  }
  
  //  user related apis
  async findAllRoles(): Promise<RoleEntity[]> {
    try {
      const roles = await this.rolesRepository.find({
        order: { name: 'ASC' }
      });
      return roles;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { isDeleted: false },
        order: { created_at: 'DESC' },
        relations: ['role']
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
  

  async updateUser(uguid: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid, isDeleted: false },
        relations: ['role']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${uguid} not found`);
      }

      const role = await this.rolesRepository.findOne({
        where: {rguid: updateUserDto.roleGuid}
      });

      // Validate email uniqueness if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email, isDeleted: false }
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      Object.assign(user, updateUserDto);
      user.role = role;
      user.role_id = role?.id || 1;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async toggleStatus(uguid: string, isActive: boolean): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid, isDeleted: false },
        relations: ['role']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${uguid} not found`);
      }

      user.is_active = isActive ? 1 : 0;
      user.updated_at = new Date();
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user status');
    }
  }

}