// Neden LoggingInterceptor?
// - Her isteğin başlangıç/bitiş zamanını ve durum kodunu kaydetmek performans ve hata analizinde kritik.
// - Üretimde merkezi loglama/Sentry entegrasyonuna zemin hazırlar.

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest();

    const method = req?.method;
    const url = req?.url;

    // eslint-disable-next-line no-console
    console.log(`[HTTP] --> ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = http.getResponse();
          const statusCode = res?.statusCode;
          // eslint-disable-next-line no-console
          console.log(
            `[HTTP] <-- ${method} ${url} ${statusCode} (${Date.now() - now}ms)`,
          );
        },
        error: (err) => {
          const res = http.getResponse();
          const statusCode = res?.statusCode;
          // eslint-disable-next-line no-console
          console.error(
            `[HTTP] ERR ${method} ${url} ${statusCode} (${Date.now() - now}ms)`,
            err?.message || err,
          );
        },
      }),
    );
  }
}
