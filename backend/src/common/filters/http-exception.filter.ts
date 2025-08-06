import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let message: string;
    let validationErrors: any[] = [];

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const errorObj = errorResponse as any;
      message = errorObj.message;
      
      // Handle validation errors from class-validator
      if (Array.isArray(errorObj.message)) {
        validationErrors = errorObj.message;
        message = 'Validation failed';
      }
    } else {
      message = errorResponse as string;
    }

    // Log the error
    this.logger.warn(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
    );

    // Send standardized error response
    const responseBody = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: {
        code: 'HTTP_EXCEPTION',
        message,
        ...(validationErrors.length > 0 && { validationErrors }),
      },
    };

    response.status(status).json(responseBody);
  }
}