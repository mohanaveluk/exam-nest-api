import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { UpdatePasswordDto } from '../dto/auth/update-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Constants } from 'src/shared/constants/constants';
import { ApiErrorDto } from 'src/shared/dto/api-error.dto';

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
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
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
}