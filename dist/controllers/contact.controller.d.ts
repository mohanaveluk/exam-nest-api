import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dto/contact/create-contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(createContactDto: CreateContactDto): Promise<{
        message: string;
        contact: import("../models/contact.entity").Contact;
    }>;
}
