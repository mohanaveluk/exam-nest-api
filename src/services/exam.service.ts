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
import { ExamSession } from 'src/models/exam/exam-session.entity';
import { ExamSessionDto } from 'src/dto/exam/exam-session.dto';
import { In } from 'typeorm';
import { UserAnswer } from 'src/models/exam/user-answer.entity';

@Injectable()
export class ExamService {
  private examQuestionsCache: Map<string, {
    questions: Question[];
    currentIndex: number;
    startTime?: Date;
    endTime?: Date;
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
    @InjectRepository(ExamSession)
    private examSessionRepository: Repository<ExamSession>,
    @InjectRepository(UserAnswer)
    private userAnswerRepository: Repository<UserAnswer>,
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

  private serializeQuestion1(question: Question) {
    const { correctAnswers, exam, ...questionData } = question;
    return {
      ...questionData,
      options: question.options.map(({ question: _, ...option }) => option),
    };
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
    exam.totalQuestions = createExamDto.totalQuestions;
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
    //exam.totalQuestions += 1;
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

  async getExamQuestion_old(examId: string, direction?: 'next' | 'prev') {
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
        .sort(() => Math.random() - 0.5);

        const shuffledTotalQuestions = shuffledQuestions.slice(0,  shuffledQuestions.length > exam.totalQuestions ? exam.totalQuestions : shuffledQuestions.length);

      cachedExam = {
        questions: shuffledTotalQuestions,
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


  async startNewExam(examId: string, userId: string): Promise<ExamSessionDto> {
    // Clear existing cache for this exam if it exists
    this.clearExamCache(examId);

    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['questions', 'questions.options']
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

     // Check for existing active or paused session
     const statuses: ("active" | "paused" | "completed")[] = ["active", "paused"];
     const existingSession = await this.examSessionRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        status: In(statuses),
      },
    });

    if (existingSession) {
      return this.mapSessionToDto(existingSession);
    }

    // Get random questions
    const shuffledQuestions = exam.questions
      .filter(q => !q.isDeleted)
      .sort(() => Math.random() - 0.5);

    const shuffledTotalQuestions = shuffledQuestions.slice(
      0,
      shuffledQuestions.length > exam.totalQuestions ? exam.totalQuestions : shuffledQuestions.length
    );

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + exam.duration * 60000); // Convert minutes to milliseconds

    // Store question IDs in order
    const questionOrder = shuffledQuestions.map(q => q.id.toString());

    const session = await this.examSessionRepository.save({
      exam,
      userId,
      currentIndex: 0,
      status: 'active',
      startTime,
      endTime,
      totalPausedTime: 0,
      questionOrder,
      answeredQuestions: {},
    });

    const newExamCache = {
      questions: shuffledTotalQuestions,
      currentIndex: 0,
      startTime,
      endTime
    };

    this.examQuestionsCache.set(examId, newExamCache);

    /*return {
      totalQuestions: shuffledTotalQuestions.length,
      duration: exam.duration,
      startTime,
      endTime,
      status: 'active',
      currentIndex: 0,
      totalPausedTime: 0
    };*/
    return this.mapSessionToDto(session);
  }

  async getExamQuestion(examId: string, userId: string, direction?: 'next' | 'prev') {
    let cachedExam = this.examQuestionsCache.get(examId);
    const session = await this.getActiveSession(examId, userId);

    if (session.status === 'paused') {
      throw new BadRequestException('Exam is paused. Please resume to continue.');
    }

    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['questions', 'questions.options'],
    });

    // if (!cachedExam) {
    //   throw new BadRequestException('No active exam session found. Please start a new exam.');
    // }

    //// Check if exam time has expired
    // if (cachedExam.endTime && new Date() > cachedExam.endTime) {
    //   throw new BadRequestException('Exam time has expired');
    // }

    // if (direction === 'next' && cachedExam.currentIndex < cachedExam.questions.length - 1) {
    //   cachedExam.currentIndex++;
    // } else if (direction === 'prev' && cachedExam.currentIndex > 0) {
    //   cachedExam.currentIndex--;
    // }
    // Update current index based on direction
    if (direction === 'next' && session.currentIndex < session.questionOrder.length - 1) {
      session.currentIndex++;
    } else if (direction === 'prev' && session.currentIndex > 0) {
      session.currentIndex--;
    }

    await this.examSessionRepository.save(session);

    //const currentQuestion = cachedExam.questions[cachedExam.currentIndex];
    //const currentQuestion = exam.questions[session.currentIndex];
    // Get the current question based on the stored order
    const currentQuestionId = session.questionOrder[session.currentIndex];
    const currentQuestion = await this.questionRepository.findOne({
      where: { id: parseInt(currentQuestionId) },
      relations: ['options'],
    });

    if (!currentQuestion) {
      throw new NotFoundException('Question not found');
    }


    const { exam: _, ...questionData } = currentQuestion;

    /*return {
      ...this.serializeQuestion(currentQuestion, false),
      questionNumber: cachedExam.currentIndex + 1,
      totalQuestions: cachedExam.questions.length,
      timeRemaining: cachedExam.endTime ? Math.max(0, cachedExam.endTime.getTime() - new Date().getTime()) : null
    };*/

    const userAnswersFromSession = session.answeredQuestions[currentQuestionId] || [];

    // Get user's answer for this question if it exists
    const userAnswer = await this.userAnswerRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        question: { id: currentQuestion.id },
      },
    });

    return {
      ...this.serializeQuestion(currentQuestion),
      questionNumber: session.currentIndex + 1,
      totalQuestions: session.questionOrder.length,
      timeRemaining: this.calculateTimeRemaining(session),
      userAnswers: userAnswer?.selectedOptions || [],
    };
  }

  
  clearExamCache(examId: string) {
    this.examQuestionsCache.delete(examId);
  }

  async submitAnswer(examId: string, userId: string, questionId: string, answers: ValidateAnswersDto) {
    const session = await this.getActiveSession(examId, userId);

    if (session.status === 'paused') {
      throw new BadRequestException('Exam is paused. Please resume to continue.');
    }

    const question = await this.questionRepository.findOne({
      where: { id: parseInt(questionId) },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }


    // Update answered questions
    session.answeredQuestions = {
      ...(session.answeredQuestions || {}),
      [questionId]: answers.selectedAnswers,
    };

    await this.examSessionRepository.save(session);

    // Find existing answer or create new one
    let userAnswer = await this.userAnswerRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        question: { id: question.id },
      },
    });

    if (userAnswer) {
      userAnswer.selectedOptions = answers.selectedAnswers;
      await this.userAnswerRepository.save(userAnswer);
    } else {
      userAnswer = await this.userAnswerRepository.save({
        exam: session.exam,
        userId,
        question,
        questionIndex: session.currentIndex,
        selectedOptions: answers.selectedAnswers,
      });
    }



    return this.mapSessionToDto(session);
  }


  async pauseExam(examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(examId, userId);
    
    if (session.status === 'paused') {
      throw new BadRequestException('Exam is already paused');
    }

    session.status = 'paused';
    session.pausedAt = new Date();
    const updatedSession = await this.examSessionRepository.save(session);
    
    return this.mapSessionToDto(updatedSession);
  }

  async resumeExam(examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(examId, userId);
    
    if (session.status !== 'paused') {
      throw new BadRequestException('Exam is not paused');
    }

    const pauseDuration = Date.now() - session.pausedAt.getTime();
    session.totalPausedTime += pauseDuration;
    session.endTime = new Date(session.endTime.getTime() + pauseDuration);
    session.status = 'active';
    session.pausedAt = null;

    const updatedSession = await this.examSessionRepository.save(session);
    return this.mapSessionToDto(updatedSession);
  }


  async getExamProgress(examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(examId, userId);
    return this.mapSessionToDto(session);
  }

  async getExamProgress2(examId: string) {
    const cachedExam = this.examQuestionsCache.get(examId);
    
    if (!cachedExam) {
      throw new BadRequestException('No active exam session found');
    }

    return {
      currentQuestion: cachedExam.currentIndex + 1,
      totalQuestions: cachedExam.questions.length,
      timeRemaining: cachedExam.endTime ? Math.max(0, cachedExam.endTime.getTime() - new Date().getTime()) : null,
      isCompleted: cachedExam.currentIndex === cachedExam.questions.length - 1
    };
  }


  private async getActiveSession(examId: string, userId: string): Promise<ExamSession> {
    const statuses: ("active" | "paused" | "completed")[] = ["active", "paused"];
    const session = await this.examSessionRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        status: In(statuses),
      },
    });

    if (!session) {
      throw new NotFoundException('No active exam session found');
    }

    if (this.isSessionExpired(session)) {
      session.status = 'completed';
      await this.examSessionRepository.save(session);
      throw new BadRequestException('Exam session has expired');
    }

    return session;
  }

  private isSessionExpired(session: ExamSession): boolean {
    const now = new Date();
    return session.status === 'active' && now > session.endTime;
  }

  private calculateTimeRemaining(session: ExamSession): number {
    if (session.status === 'paused') {
      return session.endTime.getTime() - session.pausedAt.getTime();
    }
    return Math.max(0, session.endTime.getTime() - Date.now());
  }

  private mapSessionToDto(session: ExamSession): ExamSessionDto {
    return {
      status: session.status,
      currentIndex: session.currentIndex,
      startTime: session.startTime,
      endTime: session.endTime,
      pausedAt: session.pausedAt,
      totalPausedTime: session.totalPausedTime,
      answeredQuestions: session.answeredQuestions,
      questionOrder: session.questionOrder,
    };
  }




  //question details
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
    if (updateExamDto.totalQuestions) exam.totalQuestions = updateExamDto.totalQuestions;
    if (updateExamDto.duration) exam.duration = updateExamDto.duration;
    if (updateExamDto.passingScore) exam.passingScore = updateExamDto.passingScore;
    if (updateExamDto.status) exam.status = updateExamDto.status;
    exam.updatedAt = new Date();

    const updatedExam = await this.examRepository.save(exam);

    // Delete and save questions with their options
    if(updateExamDto.questions && updateExamDto.questions.length > 0){
      // Find all questions for the given exam ID
      const questions = await this.questionRepository.find({
        where: { exam: { id: examId } },
        relations: ['options'],
      });

      if (questions) {
        // Collect all option IDs to delete
        const optionIds = questions.flatMap(question => question.options.map(option => option.id));
        // Delete all options
        if (optionIds.length > 0) {
          await this.optionRepository.delete(optionIds);
        }
      }

      // Remove existing options
      await this.questionRepository.remove(exam.questions);

      // Create and save questions with their options
      const newQuestions = await Promise.all(
        updateExamDto.questions.map(async (questionDto) => {
          const question = new Question();
        question.question = questionDto.question;
        question.type = questionDto.type;
        question.correctAnswers = questionDto.correctAnswers;
        question.order = questionDto.order;
        question.exam = updatedExam;
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
      updatedExam.questions = newQuestions;
    }

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
      //exam.totalQuestions -= 1;
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