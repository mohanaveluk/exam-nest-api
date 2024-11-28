import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from 'src/services/custom-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : exception;

      const logMessage = {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
        params: request.params,
        status,
        message: JSON.stringify(message),
      };
  
      this.logger.error(`HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`, JSON.stringify(logMessage));
      
    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' && message !== null && 'message' in message
        ? (Array.isArray(message?.message)
          ? message?.message[0]
          : message?.message)
        : 'Something went wrong',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}