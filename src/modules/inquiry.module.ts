import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryController } from 'src/controllers/inquiry.controller';
import { InquiryResponse } from 'src/models/inquiry/inquiry-response.entity';
import { Inquiry } from 'src/models/inquiry/inquiry.entity';
import { User } from 'src/models/user.entity';
import { InquiryService } from 'src/services/inquiry.service';


@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, InquiryResponse, User])],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}