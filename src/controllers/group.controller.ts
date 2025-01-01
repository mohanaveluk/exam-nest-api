import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GroupService } from '../services/group.service';
import { CreateGroupDto, UpdateGroupDto } from 'src/dto/auth/group.dto';
import { Group } from 'src/models/auth/group.entity';
import { GroupResponseDto } from 'src/dto/auth/group-response.dto';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 200, description: 'Group created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupService.create(createGroupDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto
  ): Promise<Group> {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  delete(@Param('id') id: string): Promise<void> {
    return this.groupService.delete(id);
  }

  @Get()
  @AllowRoles(UserRole.Admin) // Only admins can view all groups
  @ApiOperation({
    summary: 'Get all groups with permissions',
    description: 'Retrieves a list of all groups with their associated permissions. Requires admin role.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups retrieved successfully',
    type: [GroupResponseDto]
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated' 
  })
  @ApiForbiddenResponse({ 
    description: 'User does not have required permissions' 
  })
  async findAllWithPermissions(): Promise<Group[]> {
    return this.groupService.findAllWithPermissions();
  }
  
  @Post('users/:userId/groups/:groupId')
  @ApiOperation({ summary: 'Add user to group' })
  @ApiResponse({ status: 200, description: 'User added to the Group successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addUserToGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string
  ): Promise<void> {
    return this.groupService.addUserToGroup(userId, groupId);
  }

  @Delete('users/:userId/groups/:groupId')
  @ApiOperation({ summary: 'Remove user from group' })
  @ApiResponse({ status: 200, description: 'User removed from the Group successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeUserFromGroup1(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string
  ): Promise<void> {
    return this.groupService.removeUserFromGroup(userId, groupId);
  }

  @Get('users/:userId/groups')
  @ApiOperation({ summary: 'Get user groups' })
  @ApiResponse({ status: 200, description: 'Retrieved user group successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserGroups(@Param('userId') userId: string): Promise<Group[]> {
    return this.groupService.getUserGroups(userId);
  }

  @Get('with-users')
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Get all groups with users',
    description: 'Retrieves all groups with their associated users and permissions. Requires admin role.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups with users retrieved successfully',
    type: [Group]
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role'
  })
  async getAllGroupsWithUsers(): Promise<Group[]> {
    return this.groupService.findAllWithUsers();
  }

  @Delete('users/:userId/groups/:groupId')
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Remove user from group',
    description: 'Removes a user from a specific group. Requires admin role.'
  })
  @ApiParam({ name: 'userId', description: 'GUID of the user to remove' })
  @ApiParam({ name: 'groupId', description: 'ID of the group to remove user from' })
  @ApiResponse({
    status: 200,
    description: 'User successfully removed from group'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role'
  })
  @ApiResponse({
    status: 404,
    description: 'User or group not found'
  })
  async removeUserFromGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string
  ): Promise<void> {
    return this.groupService.removeUserFromGroup(userId, groupId);
  }

  
}