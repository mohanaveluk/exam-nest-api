import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from '../controllers/contact.controller';
import { ContactService } from '../services/contact.service';
import { Contact } from '../models/contact.entity';
import { EmailModule } from '../email/email.module';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { LogModule } from './log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    EmailModule,
    LogModule
  ],
  controllers: [ContactController],
  providers: [ContactService]
})
export class ContactModule {}