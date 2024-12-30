import { Controller, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserGroupsService } from '../services/user-groups.service';
import { AddUserToGroupDto } from 'src/dto/auth/user-groups.dto';

@ApiTags('user-groups')
@Controller('user-groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Add user to group' })
  @ApiResponse({ status: 200, description: 'User added to the group successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  addUserToGroup(@Body() dto: AddUserToGroupDto): Promise<void> {
    return this.userGroupsService.addUserToGroup(dto.userId, dto.groupId);
  }

  @Delete(':userId/:groupId')
  @ApiOperation({ summary: 'Remove user from group' })
  @ApiResponse({ status: 200, description: 'User removed from group successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  removeUserFromGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string
  ): Promise<void> {
    return this.userGroupsService.removeUserFromGroup(userId, groupId);
  }
}