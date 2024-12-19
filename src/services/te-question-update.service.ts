import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TE_UpdateQuestionDto } from 'src/dto/trial-exam/te-update-question.dto';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { Repository } from 'typeorm';
import { TE_OptionService } from './te-option.service';


@Injectable()
export class TE_QuestionUpdateService {
  constructor(
    @InjectRepository(TE_Question)
    private questionRepository: Repository<TE_Question>,
    private optionService: TE_OptionService
  ) {}

  async updateById(id: number, updateDto: TE_UpdateQuestionDto): Promise<TE_Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Update question fields
    question.text = updateDto.text;
    question.type = updateDto.type;
    question.maxSelections = updateDto.maxSelections;
    question.explanation = updateDto.explanation;
    question.subject = updateDto.subject;

    // Save updated question
    const updatedQuestion = await this.questionRepository.save(question);

    // Update options
    updatedQuestion.options = await this.optionService.updateOptions(
      updatedQuestion,
      updateDto.options
    );

    return updatedQuestion;
  }
}