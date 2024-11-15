import { Repository } from 'typeorm';
import { Contact } from '../models/contact.entity';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
import { EmailService } from '../email/email.service';
import { CustomLoggerService } from './custom-logger.service';
export declare class ContactService {
    private contactRepository;
    private emailService;
    private logger;
    constructor(contactRepository: Repository<Contact>, emailService: EmailService, logger: CustomLoggerService);
    create(createContactDto: CreateContactDto): Promise<{
        message: string;
        contact: Contact;
    }>;
}
