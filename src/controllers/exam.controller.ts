import { Controller, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ExamService } from '../services/exam.service';
import { CreateExamDto } from '../dto/exam/create-exam.dto';
import { UpdateExamDto } from '../dto/exam/update-exam.dto';
import { UpdateQuestionDto } from '../dto/exam/update-question.dto';
import { ApiResponse } from '../dto/exam/api-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeoutInterceptor } from 'src/interceptors/timeout.interceptor';
import { UserRole } from 'src/auth/enums/role.enum';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Exam')
@UseInterceptors(TimeoutInterceptor)
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @AllowRoles(UserRole.Admin, UserRole.User)
  @ApiOperation({ summary: 'Create Exam and its question details' })
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

  @Put(':examId')
  async updateExam(
    @Param('examId') examId: string,
    @Body() updateExamDto: UpdateExamDto,
  ): Promise<ApiResponse<any>> {
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
  async updateQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<ApiResponse<any>> {
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
  async softDeleteQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: number,
  ): Promise<ApiResponse<any>> {
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
}