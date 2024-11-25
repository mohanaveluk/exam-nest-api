import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../models/exam/exam.entity';
import { Question } from '../models/exam/question.entity';
import { Option } from '../models/exam/option.entity';
import { CreateExamDto } from '../dto/exam/create-exam.dto';
import { UpdateExamDto } from '../dto/exam/update-exam.dto';
import { UpdateQuestionDto } from '../dto/exam/update-question.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
  ) {}

  private serializeExam(exam: Exam) {
    const { questions, ...examData } = exam;
    return {
      ...examData,
      questions: questions?.map(question => {
        const { options, exam: _, ...questionData } = question;
        return {
          ...questionData,
          options: options?.map(option => {
            const { question: _, ...optionData } = option;
            return optionData;
          })
        };
      })
    };
  }
  
  async create(createExamDto: CreateExamDto) {
    // Create exam entity without questions first

    const existingExam = await this.examRepository.findOne({
      where: { title: createExamDto.title },
    });

    if (existingExam) {
      throw new BadRequestException('Exam title already exist');
    }

    const exam = new Exam();
    exam.title = createExamDto.title;
    exam.description = createExamDto.description;
    exam.category = createExamDto.category;
    exam.notes = createExamDto.notes;
    exam.createdAt = new Date();
    exam.duration = createExamDto.duration;
    exam.passingScore = createExamDto.passingScore;
    exam.totalQuestions = createExamDto.questions.length;
    exam.status = createExamDto.status;

    const savedExam = await this.examRepository.save(exam);

    // Create and save questions with their options
    const questions = await Promise.all(
      createExamDto.questions.map(async (questionDto) => {
        const question = new Question();
        question.question = questionDto.question;
        question.type = questionDto.type;
        question.correctAnswers = questionDto.correctAnswers;
        question.order = questionDto.order;
        question.exam = savedExam;
        question.isDeleted = false;

        const savedQuestion = await this.questionRepository.save(question);

        // Create and save options for the question
        const options = await Promise.all(
          questionDto.options.map(async (optionText) => {
            const option = new Option();
            option.text = optionText;
            option.question = savedQuestion;
            return await this.optionRepository.save(option);
          })
        );

        savedQuestion.options = options;
        return savedQuestion;
      })
    );

    savedExam.questions = questions;
    return this.serializeExam(savedExam);
  }

  async updateExam(examId: string, updateExamDto: UpdateExamDto) {
    const exam = await this.examRepository.findOne({ 
      where: { id: examId },
      relations: ['questions', 'questions.options']
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Update only the provided fields
    if (updateExamDto.title) exam.title = updateExamDto.title;
    if (updateExamDto.description) exam.description = updateExamDto.description;
    if (updateExamDto.category) exam.category = updateExamDto.category;
    if (updateExamDto.notes) exam.notes = updateExamDto.notes;
    if (updateExamDto.duration) exam.duration = updateExamDto.duration;
    if (updateExamDto.passingScore) exam.passingScore = updateExamDto.passingScore;
    if (updateExamDto.status) exam.status = updateExamDto.status;

    const updatedExam = await this.examRepository.save(exam);
    return this.serializeExam(updatedExam);
  }

  async updateQuestion(
    examId: string,
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, exam: { id: examId } },
      relations: ['options', 'exam'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Update question fields if provided
    if (updateQuestionDto.question) question.question = updateQuestionDto.question;
    if (updateQuestionDto.type) question.type = updateQuestionDto.type;
    if (updateQuestionDto.correctAnswers) question.correctAnswers = updateQuestionDto.correctAnswers;
    if (updateQuestionDto.order) question.order = updateQuestionDto.order;

    // Update options if provided
    if (updateQuestionDto.options) {
      // Remove existing options
      await this.optionRepository.remove(question.options);

      // Create new options
      const newOptions = await Promise.all(
        updateQuestionDto.options.map(async (optionText) => {
          const option = new Option();
          option.text = optionText;
          option.question = question;
          return await this.optionRepository.save(option);
        })
      );

      question.options = newOptions;
    }

    const updatedQuestion = await this.questionRepository.save(question);
    const { exam: _, ...questionData } = updatedQuestion;
    return {
      ...questionData,
      options: updatedQuestion.options.map(option => {
        const { question: _, ...optionData } = option;
        return optionData;
      })
    };
  }

  async softDeleteQuestion(examId: string, questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, exam: { id: examId } },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.isDeleted = true;
    await this.questionRepository.save(question);

    // Update total questions count
    const exam = await this.examRepository.findOne({ where: { id: examId } });
    if (exam) {
      exam.totalQuestions -= 1;
      await this.examRepository.save(exam);
    }
  }
}