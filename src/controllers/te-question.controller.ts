import { Controller, Get, Post, Body, Param, Query, Put, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse} from '@nestjs/swagger';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { ApiResponse } from 'src/dto/exam/api-response.dto';
import { TE_CreateQuestionDto } from 'src/dto/trial-exam/te-create-question.dto';
import { TE_QuestionDetailDto } from 'src/dto/trial-exam/te-question-detail.dto';
import { TE_SubmitAnswerDto } from 'src/dto/trial-exam/te-submit-answer.dto';
import { TE_UpdateQuestionDto } from 'src/dto/trial-exam/te-update-question.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { TE_QuestionUpdateService } from 'src/services/te-question-update.service';
import { TE_QuestionService } from 'src/services/te-question.service';


@ApiTags('Trial Questions')
@Controller('te_questions')
export class TE_QuestionController {
  constructor(private readonly questionService: TE_QuestionService,
    private readonly questionUpdateService: TE_QuestionUpdateService
  ) {}

    @Post()
    @ApiBearerAuth('JWT-auth')
    @AllowRoles(UserRole.Admin, UserRole.User)
    @UseGuards(JwtAuthGuard, AuthorizationGuard)
    @ApiOperation({ summary: 'Create a new question' })
    @SwaggerResponse({ status: 201, description: 'Question added successfully' })
    async create(@Body() createQuestionDto: TE_CreateQuestionDto): Promise<ApiResponse<TE_Question>> {
        try {
            const question = await this.questionService.create(createQuestionDto);
            return new ApiResponse(true, 'Question added successfully', question);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to add question', null, error.message),
                HttpStatus.BAD_REQUEST,
            );
        }
    }


    @Put(':id')
    @ApiBearerAuth('JWT-auth')
    @AllowRoles(UserRole.Admin, UserRole.User)
    @UseGuards(JwtAuthGuard, AuthorizationGuard)
    @ApiOperation({ summary: 'Update an existing question' })
    @SwaggerResponse({ status: 200, description: 'Question updated successfully' })
    async update(
        @Param('id') id: number,
        @Body() updateQuestionDto: TE_UpdateQuestionDto
    ): Promise<ApiResponse<TE_Question>> {
        try {
            const question = await this.questionUpdateService.updateById(id, updateQuestionDto);
            return new ApiResponse(true, 'Question updated successfully', question);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to update question', null, error.message),
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('exam/:examId/all')
    @ApiOperation({ summary: 'Get questions by exam' })
    @SwaggerResponse({ status: 200, description: 'Get question by question guid' })
    async getQuestionsByExam(
        @Param('examId') examId: string
    ): Promise<ApiResponse<TE_Question[]>> {
        try {
            const questions = await this.questionService.getQuestionsByExam(examId);
            return new ApiResponse(true, 'Question retrieved successfully', questions);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to retrieve question', null, error.message),
                HttpStatus.NOT_FOUND,
            );
        }
    }

    @Get('exam/:examId')
    @ApiOperation({ summary: 'Get questions by exam' })
    @SwaggerResponse({ status: 200, description: 'Get question by question guid' })
    async getQuestionByExam(
        @Param('examId') examId: string,
        @Query('index') index: number,
    ): Promise<ApiResponse<{ question: TE_Question; totalQuestions: number }>> {
        try {
            const question = await this.questionService.getQuestionByExam(examId, index);
            return new ApiResponse(true, 'Question retrieved successfully', question);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to retrieve question', null, error.message),
                HttpStatus.NOT_FOUND,
            );
        }
    }

    @Get('exam/:examId/question/:questionId')
    @ApiBearerAuth('JWT-auth')
    @AllowRoles(UserRole.Admin, UserRole.User)
    @UseGuards(JwtAuthGuard, AuthorizationGuard)
    @ApiOperation({ summary: 'Get question details by exam and question ID' })
    @SwaggerResponse({
        status: 200,
        description: 'Returns question details with options and correct answers',
        type: TE_QuestionDetailDto
    })
    async getQuestionDetail(
        @Param('examId') examId: string,
        @Param('questionId') questionId: number
    ): Promise<ApiResponse<TE_QuestionDetailDto>> {
        try {
            const question = await this.questionService.getQuestionDetail(examId, questionId);
            return new ApiResponse(true, 'Question retrieved successfully', question);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to retrieve question', null, error.message),
                HttpStatus.NOT_FOUND,
            );
        }
    }
    
    @Post(':id/:examId/validate')
    @ApiOperation({ summary: 'Validate answer for a question' })
    @SwaggerResponse({ status: 200, description: 'Answers validated successfully' })
    async validateAnswer(
        @Param('id') id: number,
        @Param('examId') examId: string,
        @Body() submitAnswerDto: TE_SubmitAnswerDto,
    ): Promise<ApiResponse<any>> {
        try {
            const result = await this.questionService.validateAnswer(examId, id, submitAnswerDto.selectedAnswers);
            return new ApiResponse(true, 'Answers validated successfully', result);
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to validate answers', null, error.message),
                HttpStatus.BAD_REQUEST,
            );
        }
    }


    @Delete(':examId/:id')
    @ApiBearerAuth('JWT-auth')
    @AllowRoles(UserRole.Admin, UserRole.User)
    @UseGuards(JwtAuthGuard, AuthorizationGuard)
    @ApiOperation({ summary: 'Soft delete a question' })
    async softDelete(@Param('examId') examId: string, @Param('id') id: number): Promise<ApiResponse<void>> {
        try {
            await this.questionService.softDelete(examId, id);
            return new ApiResponse(true, 'Question deleted successfully');
        } catch (error) {
            throw new HttpException(
                new ApiResponse(false, 'Failed to delete question', null, error.message),
                HttpStatus.BAD_REQUEST,
            );
        }
    }

}