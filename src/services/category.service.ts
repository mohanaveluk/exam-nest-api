import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../models/exam/category.entity';
import { CreateCategoryDto } from '../dto/exam/create-category.dto';
import { UpdateCategoryDto } from '../dto/exam/update-category.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = new Category();
    category.id = uuidv4().replace(/-/g, "");
    category.name = createCategoryDto.name;
    category.description = createCategoryDto.description;
    
    return await this.categoryRepository.save(category);
  }

  async getAllCategories() {
    return await this.categoryRepository.find({
        where: { is_active: 1 },
    });
  }

  async getCategory(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['exams']
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
    }
    if (updateCategoryDto.description) {
      category.description = updateCategoryDto.description;
    }

    return await this.categoryRepository.save(category);
  }

  async softDeleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    category.is_active = 0;
    await this.categoryRepository.save(category);
  }
}