import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFollowUpDto } from 'src/dto/inquiry/create-follow-up.dto';
import { CreateInquiryDto } from 'src/dto/inquiry/create-inquiry.dto';
import { CreateResponseDto } from 'src/dto/inquiry/create-response.dto';
import { InquiryStatsDto } from 'src/dto/inquiry/inquiry-stats.dto';
import { FollowUp } from 'src/models/inquiry/follow-up.entity';
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
      @InjectRepository(FollowUp)
      private followUpRepository: Repository<FollowUp>,
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
  
    async findOne(id: string, userId: string): Promise<Inquiry> {
      const inquiry = await this.inquiryRepository.findOne({
        where: { id, user: { id: parseInt(userId) } },
        relations: ['user', 'responses', 'responses.user','responses.followUps',
          'responses.followUps.responses',
          'responses.followUps.responses.user']
      });
      if (!inquiry) {
        throw new NotFoundException('Inquiry not found');
      }

      // Function to remove unwanted properties from user objects
      const removeSensitiveData = (user: any) => {
        if (user) {
          delete user.password;
          delete user.email;
          delete user.mobile;
          delete user.major;
          delete user.is_active;
          delete user.role_id;
        }
      };

      // Remove sensitive data from the inquiry's user and nested responses
      removeSensitiveData(inquiry.user);
      inquiry.responses.forEach(response => {
        removeSensitiveData(response.user);
        response.followUps.forEach(followUp => {
          followUp.responses.forEach(followUpResponse => {
            removeSensitiveData(followUpResponse.user);
          });
        });
      });

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

    async createFollowUp(responseId: string, createFollowUpDto: CreateFollowUpDto, userId: string): Promise<FollowUp> {
      const [response, user] = await Promise.all([
        this.responseRepository.findOne({
          where: { id: responseId },
          relations: ['inquiry', 'inquiry.user']
        }),
        this.userRepository.findOne({ where: { id: parseInt(userId) } })
      ]);
  
      if (!response) {
        throw new NotFoundException('Response not found');
      }
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Verify that the user creating the follow-up is the original inquiry creator
      if (response.inquiry.user.id !== parseInt(userId)) {
        throw new Error('Only the original inquiry creator can create follow-up questions');
      }
  
      const followUp = this.followUpRepository.create({
        content: createFollowUpDto.content,
        response,
        user,
        status: 'pending'
      });
  
      return await this.followUpRepository.save(followUp);
    }
  
    async respondToFollowUp(followUpId: string, createResponseDto: CreateResponseDto, userId: string): Promise<InquiryResponse> {
      const [followUp, admin] = await Promise.all([
        this.followUpRepository.findOne({
          where: { id: followUpId },
          relations: ['response', 'response.inquiry']
        }),
        this.userRepository.findOne({ where: { id: parseInt(userId) } })
      ]);
  
      if (!followUp) {
        throw new NotFoundException('Follow-up question not found');
      }
  
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
  
      const response = this.responseRepository.create({
        content: createResponseDto.content,
        user: admin,
        inquiry: followUp.response.inquiry,
        followUp
      });
  
      followUp.status = 'answered';
      await this.followUpRepository.save(followUp);
  
      return await this.responseRepository.save(response);
    }
  
    async findAll_old(userId: string): Promise<Inquiry[]> {
      return await this.inquiryRepository.find({
        where: { user: { id: parseInt(userId) } },
        relations: ['user', 'responses', 'responses.user'],
        order: { createdAt: 'DESC' }
      });
    }

    async findAll(userId: string): Promise<Inquiry[]> {
      const inquiries = await this.inquiryRepository.find({
        where: { user: { id: parseInt(userId) } },
        relations: [
          'user',
          'responses',
          'responses.user',
          'responses.followUps',
          'responses.followUps.responses',
          'responses.followUps.responses.user'
        ],
        order: { createdAt: 'DESC' }
      });
    
      // Function to remove unwanted properties from user objects
      const removeSensitiveData = (user: any) => {
        if (user) {
          delete user.password;
          delete user.email;
          delete user.mobile;
          delete user.major;
          delete user.is_active;
          delete user.role_id;
        }
      };
    
      // Iterate over inquiries and their nested responses to remove sensitive data
      inquiries.forEach(inquiry => {
        removeSensitiveData(inquiry.user);
        inquiry.responses.forEach(response => {
          removeSensitiveData(response.user);
          response.followUps.forEach(followUp => {
            followUp.responses.forEach(followUpResponse => {
              removeSensitiveData(followUpResponse.user);
            });
          });
        });
      });
    
      return inquiries;
    }
  }