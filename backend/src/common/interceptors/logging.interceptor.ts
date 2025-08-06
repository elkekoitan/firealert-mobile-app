import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Log request
    this.logger.log(
      `[${method}] ${url} - ${ip} - ${userAgent} - Request started`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          
          this.logger.log(
            `[${method}] ${url} - ${response.statusCode} - ${duration}ms - Request completed`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          
          this.logger.error(
            `[${method}] ${url} - ${error.status || 500} - ${duration}ms - Request failed: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}