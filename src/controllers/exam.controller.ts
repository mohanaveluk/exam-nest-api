import { Controller, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseInterceptors, Get, Query, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
import { User } from 'src/auth/decorators/user.decorator';
import { ExamSessionDto } from 'src/dto/exam/exam-session.dto';
import { exceptions } from 'winston';
import { AnswerResponseDto } from 'src/dto/exam/answer-response.dto';
import { ExamResultDto } from 'src/dto/exam/exam-result.dto';
import { ReviewQuestionResponseDto } from 'src/dto/exam/review-question-response.dto';
import { ExamResultsResponseDto } from 'src/dto/exam/exam-results-response.dto';
import { UserExamResultsDto } from 'src/dto/exam/user-exam-results.dto';

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

  @Get(':sessionId/:examId/question')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get random question for exam' })
  @SwaggerResponse({ status: 200, description: 'Random question from exam' })
  async getRandomQuestion(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @User('id') userId: any,
    @Query('direction') direction?: 'next' | 'prev',
  ): Promise<ApiResponse<QuestionResponseDto>> {
    try {
      if (!userId) {
        throw new UnauthorizedException('User is not authenticated or invalid');
      }
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const question = await this.examService.getExamQuestion(sessionId, examId, tempUserId, direction);
      return new ApiResponse(true, 'Question retrieved successfully', question);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          new ApiResponse(false, error.message, null),
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve question - session', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }



  @Post(':examId/start')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Start a new exam session' })
  @SwaggerResponse({ status: 201, description: 'Exam session started successfully' })
  async startNewExam(@Param('examId') examId: string, @User('id') userId: any): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const examSession = await this.examService.startNewExam(examId, tempUserId);
      return new ApiResponse(true, 'Exam session started successfully', examSession);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to start exam session', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':sessionId/:examId/question/:questionGuid/:atr/submit')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Submit answer for a question' })
  @SwaggerResponse({ status: 200, description: 'Answer submitted successfully' })
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @Param('questionGuid') questionGuid: string,
    @Param('atr') atr: string,
    @User('id') userId: any,
    @Body() answers: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const session = await this.examService.submitAnswer(sessionId, examId, tempUserId, questionGuid, answers, atr);
      return new ApiResponse(true, 'Answer submitted successfully', session);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to submit answer', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }



  @Put(':sessionId/:examId/pause')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Pause current exam session' })
  @SwaggerResponse({ status: 200, description: 'Exam session paused successfully' })
  async pauseExam(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const session = await this.examService.pauseExam(sessionId, examId, tempUserId);
      return new ApiResponse(true, 'Exam session paused successfully', session);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to pause exam session', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':sessionId/:examId/resume')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Resume paused exam session' })
  @SwaggerResponse({ status: 200, description: 'Exam session resumed successfully' })
  async resumeExam(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const session = await this.examService.resumeExam(sessionId, examId, tempUserId);
      return new ApiResponse(true, 'Exam session resumed successfully', session);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to resume exam session', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':sessionId/:examId/progress')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get current exam progress' })
  @SwaggerResponse({ status: 200, description: 'Exam progress retrieved successfully' })
  async getExamProgress(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const progress = await this.examService.getExamProgress(sessionId, examId, tempUserId);
      return new ApiResponse(true, 'Exam progress retrieved successfully', progress);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam progress', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':examId/session/:sessionId/question/:questionId/answer')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get answer for a specific question in an exam session' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Answer retrieved successfully',
    type: AnswerResponseDto 
  })
  async getAnswer(
    @Param('examId') examId: string,
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<AnswerResponseDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const answer = await this.examService.getAnswer(examId, sessionId, questionId, tempUserId);
      return new ApiResponse(true, 'Answer retrieved successfully', answer);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve answer', null, error.message),
        error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
      );
    }
  }
  //----------------------------

  @Get(':examId/questions')
  @ApiOperation({ summary: 'Get exam with all question for edit' })
  @SwaggerResponse({ status: 200, description: 'Exam details including questions' })
  async getExamQuestions(@Param('examId') examId: string): Promise<ApiResponse<ExamResponseDto>> {
    try {
      const exam = await this.examService.getExamWithQuestions(examId);
      return new ApiResponse(true, 'Exam details retrieved successfully', exam);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam details', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }


  @Get('/question/:qguid')
  @ApiOperation({ summary: 'Get question for a exam by question guid' })
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
  
  @Get('question/:questionGuid/options')
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
    @Param('questionId') questionId: string,
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


  @Get(':examId/session/:sessionId/results')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get exam results with detailed evaluation' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Exam results retrieved successfully',
    type: ExamResultDto 
  })
  async getExamResults(
    @Param('examId') examId: string,
    @Param('sessionId') sessionId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamResultDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const results = await this.examService.evaluateExam(sessionId, examId, tempUserId);
      return new ApiResponse(true, 'Exam results retrieved successfully', results);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam results', null, error.message),
        error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
      );
    }
  }


  //Reviewlist
  @Post(':sessionId/:examId/review/:questionId')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Add question to review list' })
  @SwaggerResponse({ status: 200, description: 'Question added to review list successfully' })
  async addToReviewList(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const session = await this.examService.addToReviewList(sessionId, examId, tempUserId, questionId);
      return new ApiResponse(true, 'Question added to review list successfully', session);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to add question to review list', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':sessionId/:examId/review/:questionId')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Remove question from review list' })
  @SwaggerResponse({ status: 200, description: 'Question removed from review list successfully' })
  async removeFromReviewList(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamSessionDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const session = await this.examService.removeFromReviewList(sessionId, examId, tempUserId, questionId);
      return new ApiResponse(true, 'Question removed from review list successfully', session);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to remove question from review list', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':sessionId/:examId/review')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get list of questions marked for review' })
  @SwaggerResponse({ status: 200, description: 'Review list retrieved successfully' })
  async getReviewList(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ReviewQuestionResponseDto[]>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const questions = await this.examService.getReviewList(sessionId, examId, tempUserId);
      return new ApiResponse(true, 'Review list retrieved successfully', questions);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve review list', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':sessionId/:examId/review/:questionId')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get specific question from review list with previous answers' })
  @SwaggerResponse({ status: 200, description: 'Review question retrieved successfully' })
  async getReviewQuestion(
    @Param('sessionId') sessionId: string,
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ReviewQuestionResponseDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const question = await this.examService.getReviewQuestion(sessionId, examId, tempUserId, questionId);
      return new ApiResponse(true, 'Review question retrieved successfully', question);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve review question', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  @Get(':examId/results')
  @AllowRoles(UserRole.User, UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Get all exam results for a specific exam' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Exam results retrieved successfully',
    type: ExamResultsResponseDto 
  })
  async getAllExamResults(
    @Param('examId') examId: string,
    @User('id') userId: any,
  ): Promise<ApiResponse<ExamResultsResponseDto>> {
    try {
      const tempUserId = typeof userId === 'object' ? `${userId.id}` : `${userId}`;
      const results = await this.examService.getAllExamResults(examId, tempUserId);
      return new ApiResponse(true, 'Exam results retrieved successfully', results);
    } catch (error) {
      throw new HttpException(
        new ApiResponse(false, 'Failed to retrieve exam results', null, error.message),
        error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
      );
    }
  }
  
}

// function SwaggerResponse(arg0: { status: number; description: string; }): (target: ExamController, propertyKey: "create", descriptor: TypedPropertyDescriptor<(createExamDto: CreateExamDto) => Promise<ApiResponse<any>>>) => void | TypedPropertyDescriptor<...> {
//   throw new Error('Function not implemented.');
// }
