import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionResponseDto } from 'src/dto/auth/permission.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Permission } from 'src/models/auth/permission.entity';
import { PermissionService } from 'src/services/auth/permission.service';


@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

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
}