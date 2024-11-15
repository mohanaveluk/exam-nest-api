import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../models/contact.entity';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
import { EmailService } from '../email/email.service';
import { contactAdminTemplate } from '../email/templates/contact-admin.template';
import { CustomLoggerService } from './custom-logger.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private emailService: EmailService,
    private logger: CustomLoggerService
  ) {}

  async create(createContactDto: CreateContactDto) {
    // Save contact form data
    const contact = this.contactRepository.create(createContactDto);
    contact.created_at = new Date();
    await this.contactRepository.save(contact);

    this.logger.debug('Sending email...');
    // Send email notification to admin
    await this.emailService.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      html: contactAdminTemplate(createContactDto),
    });

    return {
      message: 'Your message has been sent successfully',
      contact,
    };
  }
}