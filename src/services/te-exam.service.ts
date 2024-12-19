import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TE_CreateExamDto } from 'src/dto/trial-exam/te-create-exam.dto';
import { TE_UpdateExamDto } from 'src/dto/trial-exam/te-update-exam.dto';
import { TE_Exam } from 'src/models/trial-exam/te-exam.entity';
import { TE_Option } from 'src/models/trial-exam/te-option.entity';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { Repository } from 'typeorm';


@Injectable()
export class TE_ExamService {
  constructor(
    @InjectRepository(TE_Exam)
    private examRepository: Repository<TE_Exam>,
    @InjectRepository(TE_Question)
    private questionRepository: Repository<TE_Question>,
    @InjectRepository(TE_Option)
    private optionRepository: Repository<TE_Option>
  ) {}

  async create(createExamDto: TE_CreateExamDto, questions?: any[]): Promise<TE_Exam> {
    const exam = this.examRepository.create(createExamDto);
    const savedExam = await this.examRepository.save(exam);

    // Handle questions if provided
    if (questions && questions.length > 0) {
      await this.handleQuestions(savedExam, questions);
    }

    return this.findOne(savedExam.id);
  }

  async update(id: string, updateExamDto: TE_UpdateExamDto, questions?: any[]): Promise<TE_Exam> {
    const exam = await this.findOne(id);
    
    // Update only the provided fields
    Object.assign(exam, updateExamDto);
    const updatedExam = await this.examRepository.save(exam);

    // Handle questions if provided
    if (questions && questions.length > 0) {
      await this.handleQuestions(updatedExam, questions);
    }

    return this.findOne(id);
  }

  async findAll(): Promise<TE_Exam[]> {
    return this.examRepository.find({
        where: { is_active: true },
        //relations: ['questions', 'questions.options']
      });
  }

  async findOne(id: string): Promise<TE_Exam> {
    const exam = await this.examRepository.findOne({ 
        where: { id, is_active: true } ,
        //relations: ['questions', 'questions.options']
      });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async softDelete(id: string): Promise<void> {
    const exam = await this.findOne(id);
    exam.is_active = false;
    await this.examRepository.save(exam);
  }

  private async handleQuestions(exam: TE_Exam, questions: any[]): Promise<void> {
    for (const questionData of questions) {
      // Check if question exists
      let question = await this.questionRepository.findOne({
        where: { text: questionData.text, exam: { id: exam.id } },
        relations: ['options']
      });

      if (question) {
        // Update existing question
        question.type = questionData.type;
        question.subject = questionData.subject;
        question.explanation = questionData.explanation;
        question = await this.questionRepository.save(question);

        // Handle options
        await this.handleOptions(question, questionData.options);
      } else {
        // Create new question
        question = this.questionRepository.create({
          text: questionData.text,
          type: questionData.type,
          subject: questionData.subject,
          explanation: questionData.explanation,
          exam
        });
        question = await this.questionRepository.save(question);

        // Create options
        await this.handleOptions(question, questionData.options);
      }
    }
  }

  private async handleOptions(question: TE_Question, optionsData: any[]): Promise<void> {
    // Delete existing options that are not in the new options list
    const existingOptions = await this.optionRepository.find({
      where: { question: { id: question.id } }
    });

    const optionsToDelete = existingOptions.filter(existingOption => 
      !optionsData.some(newOption => newOption.text === existingOption.text)
    );

    if (optionsToDelete.length > 0) {
      await this.optionRepository.remove(optionsToDelete);
    }

    // Update or create options
    for (const optionData of optionsData) {
      let option = existingOptions.find(o => o.text === optionData.text);

      if (option) {
        // Update existing option
        option.isCorrect = optionData.isCorrect;
        await this.optionRepository.save(option);
      } else {
        // Create new option
        option = this.optionRepository.create({
          text: optionData.text,
          isCorrect: optionData.isCorrect,
          question
        });
        await this.optionRepository.save(option);
      }
    }
  }

}