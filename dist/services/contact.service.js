"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_entity_1 = require("../models/contact.entity");
const email_service_1 = require("../email/email.service");
const contact_admin_template_1 = require("../email/templates/contact-admin.template");
const custom_logger_service_1 = require("./custom-logger.service");
let ContactService = class ContactService {
    constructor(contactRepository, emailService, logger) {
        this.contactRepository = contactRepository;
        this.emailService = emailService;
        this.logger = logger;
    }
    async create(createContactDto) {
        const contact = this.contactRepository.create(createContactDto);
        contact.created_at = new Date();
        await this.contactRepository.save(contact);
        this.logger.debug('Sending email...');
        await this.emailService.sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            html: (0, contact_admin_template_1.contactAdminTemplate)(createContactDto),
        });
        return {
            message: 'Your message has been sent successfully',
            contact,
        };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService,
        custom_logger_service_1.CustomLoggerService])
], ContactService);
//# sourceMappingURL=contact.service.js.map