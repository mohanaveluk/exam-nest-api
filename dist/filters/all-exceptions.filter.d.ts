import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: CustomLoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
