import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse} from '@nestjs/swagger';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { ApiResponse } from 'src/dto/exam/api-response.dto';
import { TE_CreateExam, TE_CreateExamDto } from 'src/dto/trial-exam/te-create-exam.dto';
import { TE_CreateQuestionDto } from 'src/dto/trial-exam/te-create-question.dto';
import { TE_UpdateExam, TE_UpdateExamDto } from 'src/dto/trial-exam/te-update-exam.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/guards/jwt-authorization.guard';
import { TE_Exam } from 'src/models/trial-exam/te-exam.entity';
import { TE_ExamService } from 'src/services/te-exam.service';


@ApiTags('Trial Exam')
@Controller('te_exam')
export class TE_ExamController {
  constructor(private readonly examService: TE_ExamService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Create a new exam' })
  @SwaggerResponse({ status: 201, description: 'Exam created successfully' })
  async create(@Body() updateReq: TE_CreateExam, @Body('questions') questions?: TE_CreateQuestionDto[]): Promise<ApiResponse<TE_Exam>> {
      try {
          const exam = await this.examService.create(updateReq?.exam, questions);
          return new ApiResponse(true, 'Exam created successfully', exam);
      } catch (error) {
          throw new HttpException(
              new ApiResponse(false, `Failed to create exam - ${error.message}`, null, error.message),
              HttpStatus.BAD_REQUEST,
          );
      }
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @AllowRoles(UserRole.Admin, UserRole.User)
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @ApiOperation({ summary: 'Update an existing exam' })
  @SwaggerResponse({ status: 200, description: 'Exam updated successfully' })
  async update(@Param('id') id: string, @Body() updateReq: TE_UpdateExam, @Body('questions') questions?: any[]): Promise<ApiResponse<TE_Exam>> {
    try {
        const exam = await this.examService.update(id, updateReq?.exam, questions);
        return new ApiResponse(true, 'Exam updated successfully', exam);
    } catch (error) {
        throw new HttpException(
            new ApiResponse(false, `Failed to create exam - ${error.message}`, null, error.message),
            HttpStatus.BAD_REQUEST,
        );
    }    
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all exams' })
  @SwaggerResponse({ status: 200, description: 'List of all exams' })
  async findAll(): Promise<ApiResponse<TE_Exam[]>> {
    try {
        const exam = await this.examService.findAll();
        return new ApiResponse(true, 'Exams retrieved successfully', exam);
    } catch (error) {
        throw new HttpException(
            new ApiResponse(false, `Failed to retrieve exam - ${error.message}`, null, error.message),
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    } 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by id' })
  @SwaggerResponse({ status: 200, description: 'Exam details including questions and answers' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<TE_Exam>> {
    try {
        const exam = await this.examService.findOne(id);
        return new ApiResponse(true, 'Exam details retrieved successfully', exam);
    } catch (error) {
        throw new HttpException(
            new ApiResponse(false, `Failed to retrieve exam details - ${error.message}`, null, error.message),
            HttpStatus.NOT_FOUND,
        );
    }     
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an exam' })
  @SwaggerResponse({ status: 200, description: 'Question deleted successfully' })
  async softDelete(@Param('id') id: string): Promise<ApiResponse<void>> {
      try {
          await this.examService.softDelete(id);
          return new ApiResponse(true, 'Question deleted successfully');
      } catch (error) {
          throw new HttpException(
              new ApiResponse(false, 'Failed to delete question', null, error.message),
              HttpStatus.BAD_REQUEST,
          );
      }
  }
}