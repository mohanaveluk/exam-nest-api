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
exports.CustomLoggerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const winston = require("winston");
require("winston-daily-rotate-file");
const log_entity_1 = require("../models/log.entity");
const typeorm_2 = require("typeorm");
const logFormat = winston.format.printf(({ timestamp, level, message, context }) => {
    return `${timestamp} [${context}] ${level}: ${message}`;
});
let CustomLoggerService = class CustomLoggerService {
    constructor(logRepository) {
        this.logRepository = logRepository;
        this.logger = winston.createLogger({
            format: winston.format.combine(winston.format.timestamp(), logFormat),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), logFormat),
                }),
                new winston.transports.DailyRotateFile({
                    dirname: 'logs',
                    filename: 'application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'debug',
                }),
                new winston.transports.DailyRotateFile({
                    dirname: 'logs',
                    filename: 'error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                }),
            ],
        });
    }
    async logToDatabase(level, message, context) {
        const log = new log_entity_1.Log();
        log.level = level;
        log.message = message;
        log.context = context;
        await this.logRepository.save(log);
    }
    log(message, context) {
        this.logger.info(message, { context });
        this.logToDatabase('info', message, context);
    }
    error(message, context) {
        this.logger.error(message, { context });
        this.logToDatabase('error', message, context);
    }
    warn(message, context) {
        this.logger.warn(message, { context });
        this.logToDatabase('warn', message, context);
    }
    debug(message, context) {
        this.logger.debug(message, { context });
        this.logToDatabase('debug', message, context);
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
        this.logToDatabase('verbose', message, context);
    }
};
exports.CustomLoggerService = CustomLoggerService;
exports.CustomLoggerService = CustomLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.Log)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomLoggerService);
//# sourceMappingURL=custom-logger.service.js.map