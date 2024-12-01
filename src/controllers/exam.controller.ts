import { Controller, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseInterceptors, Get, Query, UseGuards } from '@nestjs/common';
import { ExamService } from '../services/exam.service';
import { CreateExamDto } from '../dto/exam/create-exam.dto';
import { UpdateExamDto } from '../dto/exam/update-exam.dto';
import { UpdateQuestionDto } from '../dto/exam/update-question.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse} from '@nestjs/swagger';
import { ApiResponse } from '../dto/exam/api-response.dto';
import { TimeoutInterceptor } from 'src/interceptors/timeout.interceptor';
import { UserRole } from 'src/auth/enums/role.enum';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';

import { ValidateAnswersDto } from '../dto/exam/validate-answers.dto';
import { ExamResponseDto } from '../dto/exam/exam-response.dto';
import { QuestionResponseDto } from '../dto/exam/question-response.dto';
import { OptionResponseDto } from 'src/dto/exam/option-response.dto';
import { CreateQuestionDto } from 'src/dto/exam/create-question.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';

@ApiTags('Exam')
@UseInterceptors(TimeoutInterceptor)
@Controller('u-exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @ApiOperation({ summary: 'Create Exam and its question details' })
  @SwaggerResponse({ status: 201, description: 'Exam created successfully' })
  async create(@Body() createExamDto: CreateExamDto): Promise<ApiResponse<any>> {
    try {
      const exam = await this.examService.create(createExamDto);
      return new ApiResponse(true, 'Exam created successfully', exam);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, `Failed to create exam - ${error.message}`, null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':examId/questions')
  @ApiOperation({ summary: 'Add a new question to an exam' })
  @SwaggerResponse({ status: 201, description: 'Question added successfully' })
  async addQuestion(
    @Param('examId') examId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<ApiResponse<QuestionResponseDto>> {
    try {
      const question = await this.examService.addQuestion(examId, createQuestionDto);
      return new ApiResponse(true, 'Question added successfully', question);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to add question', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all exams' })
  @SwaggerResponse({ status: 200, description: 'List of all exams' })
  async getAllExams(): Promise<ApiResponse<ExamResponseDto[]>> {
    try {
      const exams = await this.examService.getAllExams();
      return new ApiResponse(true, 'Exams retrieved successfully', exams);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exams', null, error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':examId/admin')
  @ApiOperation({ summary: 'Get exam with all details for admin' })
  @SwaggerResponse({ status: 200, description: 'Exam details including questions and answers' })
  async getExamForAdmin(@Param('examId') examId: string): Promise<ApiResponse<ExamResponseDto>> {
    try {
      const exam = await this.examService.getExamWithFullDetails(examId);
      return new ApiResponse(true, 'Exam details retrieved successfully', exam);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam details', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':examId')
  @ApiOperation({ summary: 'Get exam details without answers' })
  @SwaggerResponse({ status: 200, description: 'Exam details without answers' })
  async getExamDetails(@Param('examId') examId: string): Promise<ApiResponse<ExamResponseDto>> {
    try {
      const exam = await this.examService.getExamDetails(examId);
      return new ApiResponse(true, 'Exam details retrieved successfully', exam);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam details', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':examId/questions')
  @ApiOperation({ summary: 'Get random question for exam' })
  @SwaggerResponse({ status: 200, description: 'Random question from exam' })
  async getRandomQuestion(
    @Param('examId') examId: string,
    @Query('direction') direction?: 'next' | 'prev',
  ): Promise<ApiResponse<QuestionResponseDto>> {
    try {
      const question = await this.examService.getExamQuestion(examId, direction);
      return new ApiResponse(true, 'Question retrieved successfully', question);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve question', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('/question/:qguid')
  @ApiOperation({ summary: 'Get question for by question guid' })
  @SwaggerResponse({ status: 200, description: 'Get question by question guid' })
  async getQuestion(
    @Param('qguid') qguid: string
  ): Promise<ApiResponse<QuestionResponseDto>> {
    try {
      const question = await this.examService.getQuestion(qguid);
      return new ApiResponse(true, 'Question retrieved successfully', question);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve question', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }


  @Get(':examId/questions/:questionId/options')
  @ApiOperation({ summary: 'Get options for a specific question' })
  @SwaggerResponse({ status: 200, description: 'Question options retrieved successfully' })
  async getQuestionOptions1(
    @Param('examId') examId: string,
    @Param('questionId') questionId: number,
  ): Promise<ApiResponse<OptionResponseDto[]>> {
    try {
      const options = await this.examService.getQuestionOptions1(examId, questionId);
      return new ApiResponse(true, 'Options retrieved successfully', options);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve options', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }
  
  @Get('questions/:questionGuid/options')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get options for a specific question nu qguid' })
  @SwaggerResponse({ status: 200, description: 'Question options retrieved successfully' })
  async getQuestionOptions(
    @Param('questionGuid') questionGuid: string,
  ): Promise<ApiResponse<OptionResponseDto[]>> {
    try {
      const options = await this.examService.getQuestionOptions(questionGuid);
      return new ApiResponse(true, 'Options retrieved successfully', options);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve options', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  
  @Put(':examId')
  @ApiOperation({ summary: 'Update exam details' })
  @SwaggerResponse({ status: 200, description: 'Exam updated successfully' })
  async updateExam(
    @Param('examId') examId: string,
    @Body() updateExamDto: UpdateExamDto,
  ): Promise<ApiResponse<ExamResponseDto>> {
    try {
      const exam = await this.examService.updateExam(examId, updateExamDto);
      return new ApiResponse(true, 'Exam updated successfully', exam);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to update exam', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':examId/questions/:questionId')
  @ApiOperation({ summary: 'Update exam question' })
  @SwaggerResponse({ status: 200, description: 'Question updated successfully' })
  async updateQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<ApiResponse<QuestionResponseDto>> {
    try {
      const question = await this.examService.updateQuestion(
        examId,
        questionId,
        updateQuestionDto,
      );
      return new ApiResponse(true, 'Question updated successfully', question);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to update question', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':examId/questions/:questionId')
  @ApiOperation({ summary: 'Soft delete question' })
  @SwaggerResponse({ status: 200, description: 'Question deleted successfully' })
  async softDeleteQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: number,
  ): Promise<ApiResponse<void>> {
    try {
      await this.examService.softDeleteQuestion(examId, questionId);
      return new ApiResponse(true, 'Question deleted successfully');
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to delete question', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':examId/questions/:questionId/validate')
  @ApiOperation({ summary: 'Validate answers for a question' })
  @SwaggerResponse({ status: 200, description: 'Answers validated successfully' })
  async validateAnswers(
    @Param('examId') examId: string,
    @Param('questionId') questionId: number,
    @Body() validateAnswersDto: ValidateAnswersDto,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.examService.validateAnswers(examId, questionId, validateAnswersDto);
      return new ApiResponse(true, 'Answers validated successfully', result);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to validate answers', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

// function SwaggerResponse(arg0: { status: number; description: string; }): (target: ExamController, propertyKey: "create", descriptor: TypedPropertyDescriptor<(createExamDto: CreateExamDto) => Promise<ApiResponse<any>>>) => void | TypedPropertyDescriptor<...> {
//   throw new Error('Function not implemented.');
// }
