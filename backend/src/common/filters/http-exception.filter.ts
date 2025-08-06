// Neden özel bir HttpExceptionFilter?
// - Tüm hataları tutarlı bir JSON formatında döndürmek, frontend'in hata yönetimini kolaylaştırır.
// - Üretimde hassas bilgileri sızdırmamak; geliştirmede yeterli bağlam sağlamak.
// - Loglama ile korelasyon: isteğe dair meta bilgileri kayda geçirmek.

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Varsayılan hata (beklenmeyen durumlar için 500)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any =
      'Internal Server Error. Please contact support if the problem persists.';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse?.();
      // Nest standard response: { statusCode, message, error }
      message = (res && res.message) || exception.message || 'Error';
      details = res && res.error ? res.error : undefined;
    } else if (exception && typeof exception === 'object') {
      // Diğer hatalar (ör. ZodError, validation kütüphaneleri vb.)
      message = (exception as any).message || message;
      details = (exception as any).details || undefined;
    }

    // Basit log (ileride LoggingInterceptor ile zenginleştirilecek)
    // eslint-disable-next-line no-console
    console.error('[HttpExceptionFilter]', {
      method: request.method,
      url: request.url,
      status,
      message,
    });

    return response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      details,
    });
  }
}
