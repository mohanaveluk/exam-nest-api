import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInquiryDto } from 'src/dto/inquiry/create-inquiry.dto';
import { CreateResponseDto } from 'src/dto/inquiry/create-response.dto';
import { InquiryStatsDto } from 'src/dto/inquiry/inquiry-stats.dto';
import { InquiryResponse } from 'src/models/inquiry/inquiry-response.entity';
import { Inquiry } from 'src/models/inquiry/inquiry.entity';
import { User } from 'src/models/user.entity';
import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';


@Injectable()
export class InquiryService {
    constructor(
      @InjectRepository(Inquiry)
      private inquiryRepository: Repository<Inquiry>,
      @InjectRepository(InquiryResponse)
      private responseRepository: Repository<InquiryResponse>,
      @InjectRepository(User)
      private userRepository: Repository<User>,
    ) {}
  
    async create(createInquiryDto: CreateInquiryDto, userId: string): Promise<Inquiry> {
      const user = await this.userRepository.findOne({ where: { id: parseInt(userId) } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const inquiry = this.inquiryRepository.create({
        ...createInquiryDto,
        user,
        status: 'pending'
      });
      return await this.inquiryRepository.save(inquiry);
    }
  
    async findAll(userId: string): Promise<Inquiry[]> {
      return await this.inquiryRepository.find({
        where: { user: { id: parseInt(userId) } },
        relations: ['user', 'responses', 'responses.user'],
        order: { createdAt: 'DESC' }
      });
    }
  
    async findOne(id: string, userId: string): Promise<Inquiry> {
      const inquiry = await this.inquiryRepository.findOne({
        where: { id, user: { id: parseInt(userId) } },
        relations: ['user', 'responses', 'responses.user']
      });
      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }
      return inquiry;
    }
  
    async addResponse(id: string, createResponseDto: CreateResponseDto, userId: string): Promise<InquiryResponse> {
      const [inquiry, user] = await Promise.all([
        this.inquiryRepository.findOne({ where: { id } }),
        this.userRepository.findOne({ where: { id: parseInt(userId) } })
      ]);
  
      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const response = this.responseRepository.create({
        ...createResponseDto,
        inquiry,
        user
      });
  
      inquiry.status = 'answered';
      await this.inquiryRepository.save(inquiry);
  
      return await this.responseRepository.save(response);
    }
  
    async getStats(userId: string): Promise<InquiryStatsDto> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
      const [
        todayCount,
        thisMonthCount,
        lastMonthCount,
        totalCount,
        answeredCount,
        pendingCount
      ] = await Promise.all([
        this.inquiryRepository.count({
          where: { 
            user: { id: parseInt(userId) },
            createdAt: MoreThanOrEqual(today)
          }
        }),
        this.inquiryRepository.count({
          where: { 
            user: { id: parseInt(userId) },
            createdAt: Between(thisMonth, nextMonth),
            
          }
        }),
        this.inquiryRepository.count({
          where: { 
            user: { id: parseInt(userId) },
            createdAt: Between(lastMonth, thisMonth),
          }
        }),
        this.inquiryRepository.count({ 
          where: { user: { id: parseInt(userId) } }
        }),
        this.inquiryRepository.count({ 
          where: { user: { id: parseInt(userId) }, status: 'answered' }
        }),
        this.inquiryRepository.count({ 
          where: { user: { id: parseInt(userId) }, status: 'pending' }
        })
      ]);
  
      return {
        today: todayCount,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        total: totalCount,
        answered: answeredCount,
        pending: pendingCount
      };
    }
  
    async getNotificationCount(userId: string): Promise<number> {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
      return await this.responseRepository.count({
        where: {
          inquiry: { user: { id: parseInt(userId) } },
          createdAt: MoreThanOrEqual(fiveMinutesAgo)
        }
      });
    }
  
    async markAsRead(id: string, userId: string): Promise<void> {
      const inquiry = await this.inquiryRepository.findOne({
        where: { id, user: { id: parseInt(userId) } }
      });
  
      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }
    }
  }