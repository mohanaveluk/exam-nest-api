import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { TimeoutInterceptor } from 'src/interceptors/timeout.interceptor';

@ApiTags('Contact')
@UseInterceptors(TimeoutInterceptor)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @AllowRoles(Role.Admin, Role.User)
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiResponse({ status: 201, description: 'Contact form submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
}