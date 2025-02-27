import { 
  Controller, 
  Post, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  Put,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Req
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { UpdatePasswordDto } from '../dto/auth/update-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Constants } from 'src/shared/constants/constants';
import { ApiErrorDto } from 'src/shared/dto/api-error.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { maxFileSize } from 'src/shared/utils/file-validation.util';
import { UpdateProfileDto } from 'src/dto/auth/update-profile.dto';
import { ValidateOTCDto } from 'src/dto/auth/validate-otc.dto';
import { MobileLoginDto } from 'src/dto/auth/mobile-login.dto';
import { RequestPasswordResetDto } from 'src/dto/auth/request-password-reset.dto';
import { ResetPasswordDto } from 'src/dto/auth/reset-password.dto';
import { VerifyEmailDto } from 'src/dto/auth/verify-email.dto';
import { ResendOTCDto } from 'src/dto/auth/resend-otc.dto';
import { Permission } from 'src/models/auth/permission.entity';
import { UserResponseDto } from 'src/dto/auth/user-response.dto';
import { GenericApiResponse } from 'src/dto/common/generic-api-response.dto';
import { User } from 'src/models/user.entity';
import { ToggleUserStatusDto } from 'src/dto/auth/toggle-user-status.dto';
import { UpdateUserDto } from 'src/dto/auth/update-user.dto';
import { Request as ExpRequest } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  //@ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({
    status: 401,
    description: Constants.AUTH.UN_AUTHORIZED,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: Constants.SWAGGER.BAD_REQUEST,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 406,
    description: Constants.SWAGGER.NOT_ACCEPT,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: Constants.SWAGGER.INTERNAL_SERVER_ERROR,
    type: ApiErrorDto,
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }


  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }


  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers(): Promise<GenericApiResponse<UserResponseDto[]>> {
    try {
      const users = await this.authService.getAllUsers();
      return new GenericApiResponse(true, 'Users retrieved successfully', users);
    } catch (error) {
      throw new HttpException(
        new GenericApiResponse(false, 'Failed to retrieve categories', null, error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({
    status: 401,
    description: Constants.AUTH.UN_AUTHORIZED,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: Constants.SWAGGER.BAD_REQUEST,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 406,
    description: Constants.SWAGGER.NOT_ACCEPT,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: Constants.SWAGGER.INTERNAL_SERVER_ERROR,
    type: ApiErrorDto,
  })
  async login(@Body() loginDto: LoginDto, @Req() req: ExpRequest) {
    return await this.authService.login(loginDto, req);
  }


  @Post('mobile/login')
  @ApiOperation({ summary: 'Login with mobile number' })
  @ApiResponse({ status: 200, description: 'OTC sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - mobile number not registered' })
  async loginWithMobile(@Body() mobileLoginDto: MobileLoginDto) {
    return this.authService.loginWithMobile(mobileLoginDto);
  }

  @Post('mobile/validate')
  @ApiOperation({ summary: 'Validate OTC and login' })
  @ApiResponse({ status: 200, description: 'OTC validated successfully, returns JWT token' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired OTC' })
  async validateOTC(@Body() validateOTCDto: ValidateOTCDto) {
    return this.authService.validateOTC(validateOTCDto);
  }

  @Post('mobile/send-otc')
  @ApiOperation({ summary: 'Send OTC to mobile number' })
  @ApiResponse({ status: 200, description: 'OTC sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async sendMobileOTC(@Request() req) {
    return this.authService.sendMobileOTC(req.user.mobile);
  }


  @Post('resendotc')
  @ApiOperation({ summary: 'Send OTC to mobile number' })
  @ApiResponse({ status: 200, description: 'OTC sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async resendVerificationCode(@Body() resendOTCDto: ResendOTCDto) {
    return this.authService.resendVerificationCode(resendOTCDto);
  }

  
  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Request() req) {
    return this.authService.logout(req.user.id, req.user.uguid);
  }
  

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async userProfile(
    @Request() req: any,
  ) {
    return this.authService.getUserInfo(req.user.id);
  }


  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: maxFileSize }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.authService.uploadProfileImage(req.user.id, file);
  }

  @Post('password-reset/request')
  @Public()
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid email' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('password-reset/reset')
  @Public()
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('permissions')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  async getUserPermissions(@Request() req): Promise<Permission[]> {
    return this.authService.getUserPermissions(req.user.uguid);
  }


  @Get("roles")
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all roles',
    type: [User]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getRoles() {
    return this.authService.findAllRoles();
  }

  
  @Get("users")
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all users',
    type: [User]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getUsers() {
    return this.authService.findAllUsers();
  }

  @Put(':uguid')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: User
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async updateUser(
    @Param('uguid') uguid: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.updateUser(uguid, updateUserDto);
  }

  @Patch(':uguid/status')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ 
    status: 200, 
    description: 'User status updated successfully',
    type: User
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async toggleUserStatus(
    @Param('uguid') uguid: string,
    @Body() toggleStatusDto: ToggleUserStatusDto
  ) {
    return this.authService.toggleStatus(uguid, toggleStatusDto.isActive);
  }
}