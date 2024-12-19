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
import { AnswerResponseDto } from 'src/dto/exam/answer-response.dto';
import { ExamResultDto, QuestionResultDto } from 'src/dto/exam/exam-result.dto';
import { ExamResult } from 'src/models/exam/exam-result.entity';
import { ReviewQuestionResponseDto } from 'src/dto/exam/review-question-response.dto';
import { ExamResultsResponseDto } from 'src/dto/exam/exam-results-response.dto';
import { CategoryResultsDto, UserExamResultsDto } from 'src/dto/exam/user-exam-results.dto';

@Injectable()
export class ExamService {
  private examQuestionsCache: Map<string, {
    questions: Question[];
    currentIndex: number;
    startTime?: Date;
    endTime?: Date;
  }> = new Map();

  addToListIds: string[] = ['sX9ptU', 'PIJDju', 'BwrQnU', 'hCTOis', 'q8VE9M', '4cUG7d', 'suoNHW', 'w0b543', 'Ud69Dy', 'ZyPcQb'];
  removeFromListIds: string[] = ['D0nhUZ', 'XglVdb', 'Px5RVn', '8BdsR1', 'zWNMja', 'HzrynY', 'BXenA1', 'Fz2HFg', 'bTE9qw', 'TdIP5P'];

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
    @InjectRepository(ExamResult)
    private examResultRepository: Repository<ExamResult>,
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

  async getExamQuestion(sessionId: string, examId: string, userId: string, direction?: 'next' | 'prev') {
    let cachedExam = this.examQuestionsCache.get(examId);
    const session = await this.getActiveSession(sessionId, examId, userId);

    if (session.status === 'paused') {
      //throw new BadRequestException('Exam is paused. Please resume to continue.');
    }

    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['questions', 'questions.options'],
    });


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
        session: { id: sessionId },
        question: { id: currentQuestion.id },
        userId
      }
    });

    const userAnswerMaxQuestion = await this.userAnswerRepository.createQueryBuilder('userAnswer')
      .where('userAnswer.examId = :examId', { examId })
      .andWhere('userAnswer.sessionId = :sessionId', { sessionId })
      .andWhere('userAnswer.userId = :userId', { userId })
      .orderBy('userAnswer.questionIndex', 'DESC')
      .getOne();

    const questionCurrentIndex = userAnswerMaxQuestion ? userAnswerMaxQuestion.questionIndex: 0;
      
    return {
      ...this.serializeQuestion(currentQuestion),
      questionNumber: session.currentIndex + 1,
      totalQuestions: session.questionOrder.length,
      timeRemaining: this.calculateTimeRemaining(session),
      userAnswers: userAnswer?.selectedOptions || [],
      questionIndex: session.currentIndex, //userAnswer?.questionIndex === undefined ? questionCurrentIndex : userAnswer?.questionIndex,
      reviewList: session.reviewList
    };
  }

  
  clearExamCache(examId: string) {
    this.examQuestionsCache.delete(examId);
  }

  async submitAnswer(sessionId: string, examId: string, userId: string, questionGuid: string, answers: ValidateAnswersDto, addToReview: string = "kjmGrZ") {
    const session = await this.getActiveSession(sessionId, examId, userId);

    const exam = await this.examRepository.findOne({
      where: { id: examId }
    });

    if (session.status === 'paused') {
      throw new BadRequestException('Exam is paused. Please resume to continue.');
    }

    if (this.isSessionExpired(session)) {
      session.status = 'completed';
      await this.examSessionRepository.save(session);
      throw new BadRequestException('Exam session has expired');
    }

    const question = await this.questionRepository.findOne({
      //where: { id: parseInt(questionId) },
      where: { qguid: questionGuid },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Validate if the question is part of the current session
    const questionIndex = session.questionOrder.indexOf(question?.id?.toString());
    if (questionIndex === -1) {
      throw new BadRequestException('This question is not part of the current exam session');
    }


    // Update answered questions
    session.answeredQuestions = {
      ...(session.answeredQuestions || {}),
      [questionGuid]: answers?.selectedAnswers,
    };

    //add/Remove ReviewList function
    if (!session.reviewList) {
      session.reviewList = [];
    }

    if(addToReview === "bSUw7u"){ //Add
      if (!session.reviewList.includes(question.id.toString())) {
        session.reviewList.push(question.id.toString());
      }
    } 
    else if(addToReview === "kjmGrZ"){ //remove
      if (session.reviewList) {
        session.reviewList = session.reviewList.filter(id => id !== question.id.toString());
      }
    }

    await this.examSessionRepository.save(session);

    // Find existing answer or create new one
    let userAnswer = await this.userAnswerRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        question: { id: question.id },
        session: { id: session.id }
      },
    });

    if (userAnswer) {
      userAnswer.selectedOptions = answers.selectedAnswers;
      await this.userAnswerRepository.save(userAnswer);
    } else {
      userAnswer = await this.userAnswerRepository.save({
        exam: exam,
        userId,
        question,
        session,
        questionIndex: questionIndex,
        selectedOptions: answers.selectedAnswers,
      });
    }

    return this.mapSessionToDto(session);
  }


  async pauseExam(sessionId: string, examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);
    
    if (session.status === 'paused') {
      throw new BadRequestException('Exam is already paused');
    }

    session.status = 'paused';
    session.pausedAt = new Date();
    const updatedSession = await this.examSessionRepository.save(session);
    
    return this.mapSessionToDto(updatedSession);
  }

  async resumeExam(sessionId: string, examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);
    
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


  async getExamProgress(sessionId:string, examId: string, userId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);
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


  async getAnswer(examId: string, sessionId: string, questionGuid: string, userId: string): Promise<AnswerResponseDto> {
    // Verify the session exists and belongs to the user
    const session = await this.examSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.exam', 'exam')
      .where('session.id = :sessionId', { sessionId })
      .andWhere('exam.id = :examId', { examId })
      .andWhere('session.userId = :userId', { userId })
      .andWhere('session.status IN (:...statuses)', { statuses: ['active', 'paused'] })
      .getOne();

    if (!session) {
      throw new NotFoundException('Exam session not found or not accessible');
    }

    const question = await this.questionRepository.findOne({
      //where: { id: parseInt(questionId) },
      where: { qguid: questionGuid },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Find the answer for the specific question in this session
    /*const answer1 = await this.userAnswerRepository.findOne({
      where: {
        exam: { id: examId },
        session: { id: sessionId },
        question: { id: question.id },
        userId
      }
    });*/

    const answer = await this.userAnswerRepository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.exam', 'exam')
      .leftJoinAndSelect('answer.session', 'session')
      .leftJoinAndSelect('answer.question', 'question')
      .where('exam.id = :examId', { examId })
      .andWhere('session.id = :sessionId', { sessionId })
      .andWhere('question.id = :questionId', { questionId: question.id })
      .andWhere('answer.userId = :userId', { userId })
      .getOne();
      

    if (!answer) {
      throw new NotFoundException('Answer not found for this question');
    }

    return {
      id: answer.id,
      selectedOptions: answer.selectedOptions,
      questionIndex: answer.questionIndex,
      createdAt: answer.createdAt
    };
  }

  //Review list functions

  async addToReviewList(sessionId: string, examId: string, userId: string, questionId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);

    if (!session.reviewList) {
      session.reviewList = [];
    }

    if (!session.reviewList.includes(questionId)) {
      session.reviewList.push(questionId);
      await this.examSessionRepository.save(session);
    }

    return this.mapSessionToDto(session);
  }

  async removeFromReviewList(sessionId: string, examId: string, userId: string, questionId: string): Promise<ExamSessionDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);

    if (session.reviewList) {
      session.reviewList = session.reviewList.filter(id => id !== questionId);
      await this.examSessionRepository.save(session);
    }

    return this.mapSessionToDto(session);
  }

  async getReviewList(sessionId: string, examId: string, userId: string): Promise<ReviewQuestionResponseDto[]> {
    const session = await this.getActiveSession(sessionId, examId, userId);

    if (!session.reviewList || session.reviewList.length === 0) {
      return [];
    }

    const questions = await this.questionRepository.find({
      where: { id: In(session.reviewList.map(id => parseInt(id))), exam: { id: examId } },
      relations: ['options']
    });

    const userAnswers = await this.userAnswerRepository.find({
      relations: ['question'],
      where: {
        exam: { id: examId },
        session: { id: sessionId },
        userId,
        question: { id: In(questions.map(q => q.id)) }
      }
    });

    return questions.map(question => {
      const userAnswer = userAnswers.find(ua => ua.question.id === question.id);
      return {
        id: question.id,
        question: question.question,
        qguid: question.qguid,
        type: question.type,
        options: question.options.map(option => ({
          id: option.id,
          text: option.text
        })),
        questionIndex: userAnswer?.questionIndex,
        userAnswers: userAnswer?.selectedOptions || [],
        questionNumber: session.questionOrder.indexOf(question.id.toString()) + 1,
        totalQuestions: session.questionOrder.length,
        timeRemaining: this.calculateTimeRemaining(session)
      };
    });
  }

  async getReviewQuestion(sessionId: string, examId: string, userId: string, questionId: string): Promise<ReviewQuestionResponseDto> {
    const session = await this.getActiveSession(sessionId, examId, userId);

    const question = await this.questionRepository.findOne({
      where: { qguid: questionId, exam: { id: examId } },
      relations: ['options']
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (!session.reviewList?.includes(question.id?.toString())) {
      throw new NotFoundException('Question not found in review list');
    }

    const userAnswer = await this.userAnswerRepository.findOne({
      where: {
        exam: { id: examId },
        userId,
        question: { id: question.id }
      }
    });

    return {
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text
      })),
      questionIndex: userAnswer?.questionIndex,
      userAnswers: userAnswer?.selectedOptions || [],
      questionNumber: session.questionOrder.indexOf(question.id.toString()) + 1,
      totalQuestions: session.questionOrder.length,
      timeRemaining: this.calculateTimeRemaining(session)
    };
  }

  private calculateTimeRemaining(session: ExamSession): number {
    if (session.status === 'completed') {
      return 0;
    }

    const now = new Date();
    const endTime = new Date(session.endTime);
    const pausedTime = session.totalPausedTime || 0;

    if (session.status === 'paused') {
      const pausedAt = new Date(session.pausedAt);
      const additionalPausedTime = now.getTime() - pausedAt.getTime();
      return Math.max(0, endTime.getTime() - now.getTime() - pausedTime - additionalPausedTime);
    }

    return Math.max(0, endTime.getTime() - now.getTime() - pausedTime);
  }



  private async getActiveSession(sessionId: string, examId: string, userId: string): Promise<ExamSession> {
   
    const session = await this.examSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.exam', 'exam')
      .where('session.id = :sessionId', { sessionId })
      .andWhere('exam.id = :examId', { examId })
      .andWhere('session.userId = :userId', { userId })
      .andWhere('session.status IN (:...statuses)', { statuses: ['active', 'paused'] })
      .getOne();


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

  private calculateTimeRemaining1(session: ExamSession): number {
    if (session.status === 'paused') {
      return session.endTime.getTime() - session.pausedAt.getTime();
    }
    return Math.max(0, session.endTime.getTime() - Date.now());
  }

  private mapSessionToDto(session: ExamSession): ExamSessionDto {
    return {
      id: session.id,
      status: session.status,
      currentIndex: session.currentIndex,
      startTime: session.startTime,
      endTime: session.endTime,
      pausedAt: session.pausedAt,
      totalPausedTime: session.totalPausedTime,
      answeredQuestions: session.answeredQuestions,
      questionOrder: session.questionOrder,
      reviewList: session.reviewList || []
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
  
  //validate exam result again user answer table

  async evaluateExam(sessionId: string, examId: string, userId: string): Promise<ExamResultDto> {
    // First check if result already exists
    const existingResult = await this.examResultRepository.findOne({
      where: {
        session: { id: sessionId },
        exam: { id: examId },
        userId
      },
      relations: ['exam', 'session']
    });

    if (existingResult) {
      return {
        sessionId,
        exam: {
          id: existingResult.exam.id,
          title: existingResult.exam.title,
          description: existingResult.exam.description,
          duration: existingResult.exam.duration,
          passingScore: existingResult.exam.passingScore,
          category: {
            cguid: "", //existingResult.exam.category?.id,
            name: "", //existingResult.exam.category?.name,
            description: "", //existingResult.exam.category?.description
          }
        },
        createdAt: existingResult.createdAt,
        totalQuestions: existingResult.totalQuestions,
        correctAnswers: existingResult.correctAnswers,
        scorePercentage: Number(existingResult.scorePercentage),
        passed: existingResult.passed,
        questions: existingResult.questionResults
      };
    }

    // Get the exam session with related exam
    const session = await this.examSessionRepository.findOne({
      where: { 
        id: sessionId,
        exam: { id: examId },
        userId
      },
      relations: ['exam']
    });

    if (!session) {
      throw new NotFoundException('Exam session not found');
    }

    if (session.status !== 'completed') {
      session.status = 'completed';
      await this.examSessionRepository.save(session);
    }

    // Get all questions for this exam
    const questions = await this.questionRepository.find({
      where: { exam: { id: examId } },
      relations: ['options']
    });

    // Get all user answers for this session
    const userAnswers = await this.userAnswerRepository.find({
      where: {
        exam: { id: examId },
        session: { id: sessionId },
        userId
      },
      relations: ['question']
    });

    // Evaluate each question
    const questionResults: QuestionResultDto[] = [];
    let correctAnswers = 0;

    for (const question of questions) {
      const userAnswer = userAnswers.find(ua => ua.question.id === question.id);
      const isCorrect = this.evaluateAnswer(question, userAnswer?.selectedOptions || []);

      if (isCorrect) {
        correctAnswers++;
      }

      questionResults.push({
        questionId: question.id,
        qguid: question.qguid,
        question: question.question,
        type: question.type,
        selectedOptions: userAnswer?.selectedOptions || [],
        correctOptions: question.type === "ranking" 
        ? question.order.map(ans => ans).map(position => question.options[position-1]?.id) //.sort((a, b) => a - b)
        : question.correctAnswers.map(ans => ans).map(position => question.options[position-1]?.id).sort((a, b) => a - b),
        isCorrect
      });
    }

    const totalQuestions = questions.length;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    const passed = scorePercentage >= session.exam.passingScore;
    const createdAt = new Date()
    // Store the result
    const result = await this.examResultRepository.save({
      exam: session.exam,
      session,
      userId,
      totalQuestions,
      correctAnswers,
      scorePercentage,
      passed,
      questionResults,
      createdAt
    });

    
    return {
      sessionId,
      exam: {
        id: session.exam.id,
        title: session.exam.title,
        description: session.exam.description,
        duration: session.exam.duration,
        passingScore: session.exam.passingScore,
        category: {
          cguid: "", //session.exam.category.id,
          name: "", //session.exam.category?.name,
          description: "", //session.exam.category?.description
        }
      },
      totalQuestions,
      correctAnswers,
      scorePercentage,
      passed,
      questions: questionResults,
      createdAt
    };
  }

  private evaluateAnswer(question: Question, selectedOptions: number[]): boolean {
    // Sort both arrays to compare them regardless of order
    const sortedSelected = [...selectedOptions].sort();
    //const sortedCorrect = [...question.correctAnswers].sort();
    const sortedCorrect = question.correctAnswers?.map(ans => ans).map(position => question.options[position-1]?.id).sort((a, b) => a - b);
    const rankingCorrect = question.order?.map(ans => ans).map(position => question.options[position-1]?.id);

    // For single and multiple choice questions
    if (question.type === 'single' || question.type === 'multiple') {
      if (sortedSelected.length !== sortedCorrect.length) {
        return false;
      }
      return sortedSelected.every((option, index) => option.toString() === sortedCorrect[index].toString());
    }

    // For true/false questions
    if (question.type === 'true-false') {
      return (typeof sortedSelected[0] === 'string' ? +sortedSelected[0]: sortedSelected[0])  === sortedCorrect[0];
    }

    // For ranking questions
    if (question.type === 'ranking') {
      return selectedOptions.every((option, index) => option === rankingCorrect[index]);
    }

    return false;
  }



  async getAllExamResults(examId: string, userId: string): Promise<ExamResultsResponseDto> {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['category']
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const results = await this.examResultRepository.find({
      where: { exam: { id: examId }, userId },
      relations: ['exam', 'session']
    });

    if (!results.length) {
      return {
        results: [],
        total: 0,
        averageScore: 0,
        passedCount: 0,
        failedCount: 0
      };
    }

    const examResults = results.map(result => ({
      sessionId: result.session.id,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        passingScore: exam.passingScore,
        category: {
          cguid: exam.category?.id || '',
          name: exam.category?.name || '',
          description: exam.category?.description || ''
        }
      },
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      scorePercentage: Number(result.scorePercentage),
      passed: result.passed,
      //questions: result.questionResults,
      createdAt: result.createdAt
    }));

    const passedCount = results.filter(result => result.passed).length;
    const averageScore = results.reduce((acc, curr) => acc + Number(curr.scorePercentage), 0) / results.length;

    return {
      results: examResults,
      total: results.length,
      averageScore: Number(averageScore.toFixed(2)),
      passedCount,
      failedCount: results.length - passedCount
    };
  }


  async getUserExamResults(userId: string): Promise<UserExamResultsDto> {
    const results = await this.examResultRepository.find({
      where: { userId },
      relations: ['exam', 'exam.category', 'session']
    });

    if (!results.length) {
      return {
        categories: [],
        overallAverageScore: 0,
        totalExams: 0,
        totalPassed: 0,
        totalFailed: 0
      };
    }

    const categoryMap = new Map<string, CategoryResultsDto>();

    results.forEach(result => {
      const category = result.exam.category;
      if (!category) return;

      const categoryId = category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          cguid: category.id,
          name: category.name,
          description: category.description,
          results: [],
          averageScore: 0,
          passedCount: 0,
          failedCount: 0
        });
      }

      const categoryData = categoryMap.get(categoryId);
      categoryData.results.push({
        sessionId: result.session.id,
        createdAt: result.createdAt,
        exam: {
          id: result.exam.id,
          title: result.exam.title,
          description: result.exam.description,
          duration: result.exam.duration,
          passingScore: result.exam.passingScore,
          category: {
            cguid: category.id,
            name: category.name,
            description: category.description
          }
        },
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        scorePercentage: Number(result.scorePercentage),
        passed: result.passed,
        questions: [], //result.questionResults
      });

      if (result.passed) {
        categoryData.passedCount++;
      } else {
        categoryData.failedCount++;
      }
    });

    // Calculate category averages
    categoryMap.forEach(category => {
      const totalScore = category.results.reduce((acc, result) => acc + result.scorePercentage, 0);
      category.averageScore = Number((totalScore / category.results.length).toFixed(2));
    });

    const categories = Array.from(categoryMap.values());
    const totalExams = results.length;
    const totalPassed = results.filter(r => r.passed).length;
    const overallAverageScore = Number(
      (results.reduce((acc, r) => acc + Number(r.scorePercentage), 0) / totalExams).toFixed(2)
    );

    return {
      categories,
      overallAverageScore,
      totalExams,
      totalPassed,
      totalFailed: totalExams - totalPassed
    };
  }

  
  async findOne(id: string): Promise<Exam> {
    const exam = await this.examRepository.findOne({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`Exam with Id ${id} not found`);
    }
    return exam;
  }

}