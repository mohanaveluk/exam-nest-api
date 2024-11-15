import { LoggerService } from '@nestjs/common';
import 'winston-daily-rotate-file';
import { Log } from 'src/models/log.entity';
import { Repository } from 'typeorm';
export declare class CustomLoggerService implements LoggerService {
    private readonly logRepository;
    private readonly logger;
    constructor(logRepository: Repository<Log>);
    logToDatabase(level: string, message: string, context?: string): Promise<void>;
    log(message: string, context?: string): void;
    error(message: string, context?: any): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
}
