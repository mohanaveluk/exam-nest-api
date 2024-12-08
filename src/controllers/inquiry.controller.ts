import { Controller, Get, Post, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AllowRoles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { ApiResponse } from 'src/dto/exam/api-response.dto';
import { CreateInquiryDto } from 'src/dto/inquiry/create-inquiry.dto';
import { CreateResponseDto } from 'src/dto/inquiry/create-response.dto';
import { InquiryStatsDto } from 'src/dto/inquiry/inquiry-stats.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { InquiryResponse } from 'src/models/inquiry/inquiry-response.entity';
import { Inquiry } from 'src/models/inquiry/inquiry.entity';
import { InquiryService } from 'src/services/inquiry.service';


@ApiTags('Inquiries')
@Controller('inquiries')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Post()
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new inquiry' })
  @SwaggerResponse({ status: 201, description: 'Inquiry created successfully' })
  async create(
    @Body() createInquiryDto: CreateInquiryDto,
    @User('id') userId: any,
  ): Promise<ApiResponse<Inquiry>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const inquiry = await this.inquiryService.create(createInquiryDto, tempUserId);
      return new ApiResponse(true, 'Inquiry created successfully', inquiry);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to create inquiry', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all inquiries for the current user' })
  @SwaggerResponse({ status: 200, description: 'Retrieved all inquiries' })
  async findAll(@User('id') userId: any): Promise<ApiResponse<Inquiry[]>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const inquiries = await this.inquiryService.findAll(tempUserId);
      return new ApiResponse(true, 'Inquiries retrieved successfully', inquiries);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve inquiries', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('stats')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get inquiry statistics' })
  @SwaggerResponse({ status: 200, description: 'Retrieved inquiry statistics' })
  async getStats(@User('id') userId: any): Promise<ApiResponse<InquiryStatsDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const stats = await this.inquiryService.getStats(tempUserId);
      return new ApiResponse(true, 'Statistics retrieved successfully', stats);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve statistics', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('notifications')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get notification count for new responses' })
  @SwaggerResponse({ status: 200, description: 'Retrieved notification count' })
  async getNotifications(@User('id') userId: any): Promise<ApiResponse<number>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const count = await this.inquiryService.getNotificationCount(tempUserId);
      return new ApiResponse(true, 'Notification count retrieved successfully', count);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve notification count', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a specific inquiry' })
  @SwaggerResponse({ status: 200, description: 'Retrieved inquiry details' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: any
  ): Promise<ApiResponse<Inquiry>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const inquiry = await this.inquiryService.findOne(id, tempUserId);
      return new ApiResponse(true, 'Inquiry retrieved successfully', inquiry);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve inquiry', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/responses')
  @AllowRoles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a response to an inquiry' })
  @SwaggerResponse({ status: 201, description: 'Response added successfully' })
  async addResponse(
    @Param('id') id: string,
    @Body() createResponseDto: CreateResponseDto,
    @User('id') adminId: any
  ): Promise<ApiResponse<InquiryResponse>> {
    try {
      const tempAdminId = typeof adminId === 'object' ? `${adminId.id}` : `${adminId}`;
      const response = await this.inquiryService.addResponse(id, createResponseDto, tempAdminId);
      return new ApiResponse(true, 'Response added successfully', response);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to add response', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/read')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark an inquiry as read' })
  @SwaggerResponse({ status: 200, description: 'Inquiry marked as read' })
  async markAsRead(
    @Param('id') id: string,
    @User('id') userId: any
  ): Promise<ApiResponse<void>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      await this.inquiryService.markAsRead(id, tempUserId);
      return new ApiResponse(true, 'Inquiry marked as read', null);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to mark inquiry as read', null, error.message),
        HttpStatus.BAD_REQUEST
      );
    }
  }
}