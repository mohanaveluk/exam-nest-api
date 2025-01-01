import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { Group } from 'src/models/auth/group.entity';


@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/groups')
  @ApiOperation({ summary: 'Get user groups' })
  @ApiResponse({ status: 200, description: 'User roups retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  getUserGroups(@Param('userId') userId: string): Promise<Group[]> {
    return this.usersService.getUserGroups(userId);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get user groups' })
  @ApiResponse({ status: 200, description: 'User roups retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  async getMyGroups(@Request() req,): Promise<Group[]> {
    return this.usersService.getUserGroups(req.user.uguid);
  }
}