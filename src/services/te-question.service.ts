import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ExamService } from './exam.service';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { TE_Option } from 'src/models/trial-exam/te-option.entity';
import { TE_ExamService } from './te-exam.service';
import { TE_CreateQuestionDto } from 'src/dto/trial-exam/te-create-question.dto';
import { TE_QuestionDetailDto } from 'src/dto/trial-exam/te-question-detail.dto';

@Injectable()
export class TE_QuestionService {
  constructor(
    @InjectRepository(TE_Question)
    private questionRepository: Repository<TE_Question>,
    @InjectRepository(TE_Option)
    private optionRepository: Repository<TE_Option>,
    private examService: TE_ExamService,
  ) {}

  
 
  async create(createQuestionDto: TE_CreateQuestionDto): Promise<TE_Question> {
    const exam = await this.examService.findOne(createQuestionDto.examId);
    
    // Check if question already exists
    const existingQuestion = await this.questionRepository.findOne({
      where: { text: createQuestionDto.text, exam: { id: exam.id } },
      relations: ['options'],
    });

    if (existingQuestion) {
      return this.updateQuestion(existingQuestion, createQuestionDto);
    }

    return this.createNewQuestion(exam, createQuestionDto);
  }

  private async createNewQuestion(exam: any, createQuestionDto: TE_CreateQuestionDto): Promise<TE_Question> {
    // Create new question
    const question = this.questionRepository.create({
      text: createQuestionDto.text,
      type: createQuestionDto.type,
      maxSelections: createQuestionDto.maxSelections,
      explanation: createQuestionDto.explanation,
      subject: createQuestionDto.subject,
      exam,
    });

    const savedQuestion = await this.questionRepository.save(question);

    // Create options
    const options = createQuestionDto.options.map(optionDto =>
      this.optionRepository.create({
        text: optionDto.text,
        isCorrect: optionDto.isCorrect,
        question: savedQuestion,
      })
    );

    // Save options
    savedQuestion.options = await this.optionRepository.save(options);
    return savedQuestion;
  }

  private async updateQuestion(existingQuestion: TE_Question, createQuestionDto: TE_CreateQuestionDto): Promise<TE_Question> {
    // Update question fields
    existingQuestion.text = createQuestionDto.text;
    existingQuestion.type = createQuestionDto.type;
    existingQuestion.maxSelections = createQuestionDto.maxSelections;
    existingQuestion.explanation = createQuestionDto.explanation;
    existingQuestion.subject = createQuestionDto.subject;

    // Save updated question
    const updatedQuestion = await this.questionRepository.save(existingQuestion);

    // Update or create options
    const updatedOptions = await this.updateOptions(updatedQuestion, createQuestionDto.options);
    updatedQuestion.options = updatedOptions;

    return updatedQuestion;
  }

  private async updateOptions(question: TE_Question, newOptions: TE_CreateQuestionDto['options']): Promise<TE_Option[]> {
    // Delete existing options that are not in the new options list
    const existingOptions = await this.optionRepository.find({
      where: { question: { id: question.id } },
    });

    const optionsToDelete = existingOptions.filter(existingOption => 
      !newOptions.some(newOption => 
        newOption.text === existingOption.text
      )
    );

    if (optionsToDelete.length > 0) {
      await this.optionRepository.remove(optionsToDelete);
    }

    // Update or create options
    const updatedOptions = await Promise.all(
      newOptions.map(async optionDto => {
        const existingOption = existingOptions.find(
          existing => existing.text === optionDto.text
        );

        if (existingOption) {
          // Update existing option
          existingOption.isCorrect = optionDto.isCorrect;
          return this.optionRepository.save(existingOption);
        } else {
          // Create new option
          const newOption = this.optionRepository.create({
            text: optionDto.text,
            isCorrect: optionDto.isCorrect,
            question,
          });
          return this.optionRepository.save(newOption);
        }
      })
    );

    return updatedOptions;
  }


  /*async create(createQuestionDto: TE_CreateQuestionDto): Promise<TE_Question> {
    const exam = await this.examService.findOne(createQuestionDto.examId);
    
    const question = this.questionRepository.create({
      ...createQuestionDto,
      exam,
    });

    const savedQuestion = await this.questionRepository.save(question);

    const options = createQuestionDto.options.map(option =>
      this.optionRepository.create({
        ...option,
        question: savedQuestion,
      }),
    );

    savedQuestion.options = await this.optionRepository.save(options);
    return savedQuestion;
  }*/

    async getQuestionsByExam(examId: string): Promise<TE_Question[]> {
      const exam = await this.examService.findOne(examId);
      const questions = await this.questionRepository.find({
        where: { exam: { id: examId }, is_active: true },
        //relations: ['options'],
        order: { id: 'ASC' },
      });
  
      if (!questions.length) {
        throw new NotFoundException('No questions found for this exam');
      }
  
      return questions;
    }
    
    
  async getQuestionByExam(examId: string, index: number): Promise<{ question: TE_Question; totalQuestions: number }> {
    const exam = await this.examService.findOne(examId);
    const questions = await this.questionRepository.find({
      where: { exam: { id: examId }, is_active: true },
      relations: ['options'],
      order: { id: 'ASC' },
    });

    if (!questions.length) {
      throw new NotFoundException('No questions found for this exam');
    }

    const questionIndex = index % questions.length;
    const question = questions[questionIndex];

    // Remove isCorrect from options before sending to client
    question.options = question.options.map(({ id, text, question }) => ({ id, text, question }));

    return {
      question,
      totalQuestions: questions.length,
    };
  }


  async getQuestionDetail(examId: string, questionId: number): Promise<TE_QuestionDetailDto> {
    // Verify exam exists and is active
    await this.examService.findOne(examId);

    const question = await this.questionRepository.findOne({
      where: {
        id: questionId,
        exam: { id: examId },
        is_active: true
      },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found in exam ${examId}`);
    }

    // Map to DTO to ensure consistent response structure
    return {
      id: question.id,
      text: question.text,
      type: question.type,
      maxSelections: question.maxSelections,
      explanation: question.explanation,
      subject: question.subject,
      is_active: question.is_active,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect
      }))
    };
  }
  

  async validateAnswer(examId: string, questionId: number, selectedAnswers: number[]): Promise<{
    isCorrect: boolean;
    correctAnswers: number[];
    explanation: string;
  }> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, is_active: true, exam: {id: examId} },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const correctOptions = question.options.filter(option => option.isCorrect);
    const correctAnswers = correctOptions.map(option => option.id);

    const isCorrect = this.arraysEqual(
      selectedAnswers.sort(),
      correctAnswers.sort(),
    );

    return {
      isCorrect,
      correctAnswers,
      explanation: question.explanation,
    };
  }

  async softDelete(examId: string, id: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id, is_active: true, exam: { id: examId }, }
    });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    question.is_active = false;
    await this.questionRepository.save(question);
  }
  
  private arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

}