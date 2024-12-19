import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TE_CreateOptionDto } from 'src/dto/trial-exam/te-create-question.dto';
import { TE_Option } from 'src/models/trial-exam/te-option.entity';
import { TE_Question } from 'src/models/trial-exam/te-question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TE_OptionService {
  constructor(
    @InjectRepository(TE_Option)
    private optionRepository: Repository<TE_Option>
  ) {}

  async updateOptions(
    question: TE_Question,
    newOptions: TE_CreateOptionDto[]
  ): Promise<TE_Option[]> {
    const existingOptions = await this.optionRepository.find({
      where: { question: { id: question.id } },
    });

    // Delete removed options
    const optionsToDelete = existingOptions.filter(
      existingOption => !newOptions.some(
        newOption => newOption.text === existingOption.text
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
          existingOption.isCorrect = optionDto.isCorrect;
          return this.optionRepository.save(existingOption);
        }

        const newOption = this.optionRepository.create({
          text: optionDto.text,
          isCorrect: optionDto.isCorrect,
          question,
        });
        return this.optionRepository.save(newOption);
      })
    );

    return updatedOptions;
  }
}