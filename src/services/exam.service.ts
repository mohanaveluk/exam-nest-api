import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../models/exam/exam.entity';
import { Question } from '../models/exam/question.entity';
import { Option } from '../models/exam/option.entity';
import { CreateExamDto } from '../dto/exam/create-exam.dto';
import { UpdateExamDto } from '../dto/exam/update-exam.dto';
import { UpdateQuestionDto } from '../dto/exam/update-question.dto';
import { v4 as uuidv4 } from 'uuid';
import { ValidateAnswersDto } from 'src/dto/exam/validate-answers.dto';
import { CreateQuestionDto } from 'src/dto/exam/create-question.dto';
import { Category } from 'src/models/exam/category.entity';

@Injectable()
export class ExamService {
  private examQuestionsCache: Map<string, {
    questions: Question[];
    currentIndex: number;
  }> = new Map();

  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  
  private serializeExam(exam: Exam, includeAnswers = false) {
    const { questions, ...examData } = exam;
    return {
      ...examData,
      questions: questions?.map(question => this.serializeQuestion(question, includeAnswers))
    };
  }

  private serializeQuestion(question: Question, includeAnswers = false) {
    const { options, exam: _, ...questionData } = question;
    const serializedQuestion = {
      ...questionData,
      //options: null
      options: options?.map(option => {
        const { question: _, ...optionData } = option;
        return optionData;
      })
    };

    if (!includeAnswers) {
      delete serializedQuestion.correctAnswers;
      delete serializedQuestion.order;
    }

    return serializedQuestion;
  }

  /*
  private serializeExam(exam: Exam, includeAnswers = false) {
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
          }),
          ...(includeAnswers ? {} : { correctAnswers: undefined })
        };
      })
    };
  }
  */
  async create(createExamDto: CreateExamDto) {
    // Create exam entity without questions first

    const existingExam = await this.examRepository.findOne({
      where: { title: createExamDto.title },
    });

    if (existingExam) {
      throw new BadRequestException('Exam title already exist');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createExamDto.categoryId }
    });
    
    const exam = new Exam();
    exam.id = uuidv4();
    exam.sid = await this.examRepository.count() + 1;
    exam.title = createExamDto.title;
    exam.description = createExamDto.description;
    //exam.category = createExamDto.category;
    exam.category = category;
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
        question.qguid = uuidv4();

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
    return this.serializeExam(savedExam, true);
  }

  async addQuestion(examId: string, createQuestionDto: CreateQuestionDto) {
    const exam = await this.examRepository.findOne({
      where: { id: examId }
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const question = new Question();
    question.question = createQuestionDto.question;
    question.type = createQuestionDto.type;
    question.correctAnswers = createQuestionDto.correctAnswers;
    question.order = createQuestionDto.order;
    question.exam = exam;
    question.isDeleted = false;
    question.qguid = uuidv4();

    const savedQuestion = await this.questionRepository.save(question);

    const options = await Promise.all(
      createQuestionDto.options.map(async (optionText) => {
        const option = new Option();
        option.text = optionText;
        option.question = savedQuestion;
        return await this.optionRepository.save(option);
      })
    );

    savedQuestion.options = options;

    // Update exam's total questions count
    exam.totalQuestions += 1;
    await this.examRepository.save(exam);

    return this.serializeQuestion(savedQuestion, true);
  }
  
  async getAllExams() {
    let exams = await this.examRepository.find({
      relations: ['category'],
      //relations: ['questions', 'questions.options'],
      where: { status: 1 }
    });

    // exams.forEach(item => {
    //   item.categoryText = item.category.name;
    // });

    return exams.map(exam => this.serializeExam(exam, false));
  }

  async getExamWithFullDetails(examId: string) {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['questions', 'questions.options']
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.serializeExam(exam, false);
  }

  async getExamWithQuestions(examId: string) {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['category', 'questions']
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.serializeExam(exam, false);
  }

  async getExamDetails(examId: string) {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['category']
      //relations: ['questions', 'questions.options']
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return this.serializeExam(exam, false);
  }

  async getExamQuestion(examId: string, direction?: 'next' | 'prev') {
    let cachedExam = this.examQuestionsCache.get(examId);

    if (!cachedExam) {
      const exam = await this.examRepository.findOne({
        where: { id: examId },
        relations: ['questions', 'questions.options']
      });

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      // Get 50 random questions
      const shuffledQuestions = exam.questions
        .filter(q => !q.isDeleted)
        .sort(() => Math.random() - 0.5)
        .slice(0, 50);

      cachedExam = {
        questions: shuffledQuestions,
        currentIndex: 0
      };

      this.examQuestionsCache.set(examId, cachedExam);
    }

    if (direction === 'next' && cachedExam.currentIndex < cachedExam.questions.length - 1) {
      cachedExam.currentIndex++;
    } else if (direction === 'prev' && cachedExam.currentIndex > 0) {
      cachedExam.currentIndex--;
    }

    const currentQuestion = cachedExam.questions[cachedExam.currentIndex];
    const { exam: _, ...questionData } = currentQuestion;
    return {
      ...this.serializeQuestion(currentQuestion, false),
      questionNumber: cachedExam.currentIndex + 1,
      totalQuestions: cachedExam.questions.length,
      // options: currentQuestion.options.map(option => {
      //   const { question: _, ...optionData } = option;
      //   return optionData;
      // })
    };
  }

  async getQuestionOptions1(examId: string, questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, exam: { id: examId }, isDeleted: false },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException('Question not found or has been deleted');
    }

    return question.options.map(option => {
      const { question: _, ...optionData } = option;
      return optionData;
    });
  }


  async getQuestionOptions(questionGuid: string) {
    const question = await this.questionRepository.findOne({
      where: { qguid: questionGuid, isDeleted: false },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException('Question not found or has been deleted');
    }

    return question.options.map(option => {
      const { question: _, ...optionData } = option;
      return optionData;
    });
    // return {
    //   options: question.options,
    //   correctAnswers: question.correctAnswers,
    //   order: question.order
    // }
  }

  async getQuestion(questionGuid: string) {
    const question = await this.questionRepository.findOne({
      where: { qguid: questionGuid, isDeleted: false },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException('Question not found or has been deleted');
    }

    return this.serializeQuestion(question, true);
  }

  async updateExam(examId: string, updateExamDto: UpdateExamDto) {
    const exam = await this.examRepository.findOne({ 
      where: { id: examId },
      relations: ['questions', 'questions.options']
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: updateExamDto.categoryId }
    });

    // Update only the provided fields
    if (updateExamDto.title) exam.title = updateExamDto.title;
    if (updateExamDto.description) exam.description = updateExamDto.description;
    exam.category = category;
    if (updateExamDto.notes) exam.notes = updateExamDto.notes;
    if (updateExamDto.duration) exam.duration = updateExamDto.duration;
    if (updateExamDto.passingScore) exam.passingScore = updateExamDto.passingScore;
    if (updateExamDto.status) exam.status = updateExamDto.status;
    exam.updatedAt = new Date();

    const updatedExam = await this.examRepository.save(exam);
    return this.serializeExam(updatedExam, true);
  }

  async updateQuestion(
    examId: string,
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const question = await this.questionRepository.findOne({
      where: { qguid: questionId, exam: { id: examId } },
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
    if (updateQuestionDto.qguid) question.qguid = updateQuestionDto.qguid;// uuidv4().replace(/-/g, "");

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
    /*return {
      ...questionData,
      options: updatedQuestion.options.map(option => {
        const { question: _, ...optionData } = option;
        return optionData;
      })
    };*/
    return this.serializeQuestion(updatedQuestion, true);
  }

  async softDeleteQuestion(examId: string, questionId: string) {
    const question = await this.questionRepository.findOne({
      where: { qguid: questionId, exam: { id: examId } },
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


  async validateAnswers(examId: string, questionId: number, validateAnswersDto: ValidateAnswersDto) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, exam: { id: examId } },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const isCorrect = this.areAnswersCorrect(
      validateAnswersDto.selectedAnswers,
      question.correctAnswers
    );

    return {
      correct: isCorrect,
      correctAnswers: question.correctAnswers,
      explanation: this.getAnswerExplanation(isCorrect, question)
    };
  }

  private areAnswersCorrect(selectedAnswers: number[], correctAnswers: number[]): boolean {
    if (selectedAnswers.length !== correctAnswers.length) {
      return false;
    }
    return selectedAnswers.sort().every((value, index) => value === correctAnswers.sort()[index]);
  }

  private getAnswerExplanation(isCorrect: boolean, question: Question): string {
    if (isCorrect) {
      return 'Correct! Well done!';
    }
    return `Incorrect. The correct answer(s) were: ${question.correctAnswers
      .map(index => question.options[index].text)
      .join(', ')}`;
  }
}