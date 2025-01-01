import { 
    Controller, 
    Post, 
    Put,
    Get,
    Body, 
    Param,
    UseGuards,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    ParseUUIDPipe,
    Delete,
    ForbiddenException
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBody,
    ApiParam
  } from '@nestjs/swagger';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { CreatePermissionDto } from 'src/dto/auth/create-permission.dto';
import { PermissionResponseDto } from 'src/dto/auth/permission.dto';
import { UpdatePermissionDto } from 'src/dto/auth/update-permission.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Permission } from 'src/models/auth/permission.entity';
import { PermissionService } from 'src/services/auth/permission.service';


@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Create new permissions for a resource',
    description: 'Creates multiple permissions for a resource with specified actions and descriptions'
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permissions created successfully',
    type: [Permission]
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated' 
  })
  @ApiForbiddenResponse({ 
    description: 'User does not have required permissions' 
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or mismatched actions and descriptions'
  })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission[]> {
    try {
      const actions = createPermissionDto.actions.split(',').map(a => a.trim());
      const descriptions = createPermissionDto.descriptions.split(',').map(d => d.trim());

      if (actions.length !== descriptions.length) {
        throw new BadRequestException(
          'Number of actions must match number of descriptions'
        );
      }

      return await this.permissionService.createMultiple(
        createPermissionDto.resource,
        actions,
        descriptions
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create permissions',
        error.message
      );
    }
  }

  @Put(':resource')
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Update permissions for a resource',
    description: 'Updates existing permissions for a resource with new actions and descriptions'
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
    type: [Permission]
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated' 
  })
  @ApiForbiddenResponse({ 
    description: 'User does not have required permissions' 
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or mismatched actions and descriptions'
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found'
  })
  async update(
    @Param('resource') resource: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission[]> {
    try {
      const actions = updatePermissionDto.actions?.split(',').map(a => a.trim());
      const descriptions = updatePermissionDto.descriptions?.split(',').map(d => d.trim());

      if (actions && descriptions && actions.length !== descriptions.length) {
        throw new BadRequestException(
          'Number of actions must match number of descriptions'
        );
      }

      return await this.permissionService.updateByResource(
        resource,
        actions,
        descriptions
      );
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update permissions',
        error.message
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieves a list of all available permissions in the system'
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    type: [PermissionResponseDto]
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error occurred while retrieving permissions'
  })
  async findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(':resource')
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Get permissions by resource',
    description: 'Retrieves all permissions for a specific resource'
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource name to get permissions for',
    example: 'exams'
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto]
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated' 
  })
  @ApiForbiddenResponse({ 
    description: 'User does not have required permissions' 
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found'
  })
  async findByResource(@Param('resource') resource: string): Promise<Permission[]> {
    try {
      const permissions = await this.permissionService.findByResource(resource);
      if (!permissions.length) {
        throw new NotFoundException(`No permissions found for resource: ${resource}`);
      }
      return permissions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve permissions',
        error.message
      );
    }
  }

  @Delete(':id')
  @AllowRoles(UserRole.Admin) 
  @ApiOperation({
    summary: 'Delete permission by ID',
    description: 'Deletes a specific permission by its ID'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the permission to delete',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully'
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated' 
  })
  @ApiForbiddenResponse({ 
    description: 'User does not have required permissions' 
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found'
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const permission = await this.permissionService.findById(id);
      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      const canDelete = await this.permissionService.canDeletePermission(id);
      if (!canDelete) {
        throw new ForbiddenException(
          'Cannot delete permission as it is referenced in group permissions'
        );
      }
      
      //await this.permissionService.remove(id);
      await this.permissionService.deletePermission(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete permission',
        error.message
      );
    }
  }

}