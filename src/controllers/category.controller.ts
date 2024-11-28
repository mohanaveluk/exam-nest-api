import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/exam/create-category.dto';
import { UpdateCategoryDto } from '../dto/exam/update-category.dto';
import { ApiResponse as ResponseDto } from '../dto/exam/api-response.dto';
import { CategoryResponseDto } from '../dto/exam/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ResponseDto<CategoryResponseDto>> {
    try {
      const category = await this.categoryService.create(createCategoryDto);
      return new ResponseDto(true, 'Category created successfully', category);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Failed to create category', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories' })
  async getAllCategories(): Promise<ResponseDto<CategoryResponseDto[]>> {
    try {
      const categories = await this.categoryService.getAllCategories();
      return new ResponseDto(true, 'Categories retrieved successfully', categories);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Failed to retrieve categories', null, error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':cguid')
  @ApiOperation({ summary: 'Get category by CGUID' })
  @ApiResponse({ status: 200, description: 'Category details' })
  async getCategory(@Param('cguid') cguid: string): Promise<ResponseDto<CategoryResponseDto>> {
    try {
      const category = await this.categoryService.getCategory(cguid);
      return new ResponseDto(true, 'Category retrieved successfully', category);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Failed to retrieve category', null, error.message),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':cguid')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('cguid') cguid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseDto<CategoryResponseDto>> {
    try {
      const category = await this.categoryService.updateCategory(cguid, updateCategoryDto);
      return new ResponseDto(true, 'Category updated successfully', category);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Failed to update category', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':cguid')
  @ApiOperation({ summary: 'delete category' })
  @ApiResponse({ status: 200, description: 'Category soft deleted successfully' })
  async softDeleteCategory(@Param('cguid') cguid: string) {
    await this.categoryService.softDeleteCategory(cguid);
    return { message: 'Category soft deleted successfully' };
  }
}