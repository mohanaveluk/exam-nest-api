import { Controller, HttpException, HttpStatus, Get, UseGuards, NotFoundException, BadRequestException, Param } from '@nestjs/common';
import { ExamService } from '../services/exam.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse} from '@nestjs/swagger';
import { ApiResponse } from '../dto/exam/api-response.dto';
import { UserRole } from 'src/auth/enums/role.enum';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { UserExamResultsDto } from 'src/dto/exam/user-exam-results.dto';
const  SECRET_CODE = "dd5c8ff7";

@ApiTags('User Exam Results')
@Controller('user-exam')
export class UserExamController {
  constructor(private readonly examService: ExamService) {}

    @Get(':secode/results/history')
    @AllowRoles(UserRole.User, UserRole.Admin)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, AuthorizationGuard)
    @ApiOperation({ summary: 'Get all exam results for the current user' })
    @SwaggerResponse({
        status: 200,
        description: 'User exam results retrieved successfully',
        type: UserExamResultsDto
    })
    async getUserExamResults(
        @Param('secode') secretCode: string,
        @User('id') userId: any,
    ): Promise<ApiResponse<UserExamResultsDto>> {
        try {
            if (secretCode !== SECRET_CODE) {
                throw new BadRequestException("Invalid request");
            }
            const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
            const results = await this.examService.getUserExamResults(tempUserId);
            return new ApiResponse(true, 'User exam results retrieved successfully', results);
        } catch (error) {
            if (error.message === 'Invalid request') {
                throw new HttpException(
                    new ApiResponse(false, `Error: ${error.message}`, null, error.message),
                    error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
                );
            }
            throw new HttpException(
                new ApiResponse(false, 'Failed to retrieve user exam results', null, error.message),
                error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
            );
        }
    }
}