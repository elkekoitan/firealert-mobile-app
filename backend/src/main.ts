// Neden bu dosya ve bu yapı?
// - NestFactory ile uygulamayı ayağa kaldırıyoruz.
// - Global ValidationPipe: DTO'larda şema doğrulaması (güvenlik: beklenmeyen alanları strip).
// - Global HttpExceptionFilter ve LoggingInterceptor: tutarlı hata/izleme.
// - Swagger: Contract-first'e paralel olarak developer deneyimi ve doğrulama için.
// - CORS: Mobil istemci ve local geliştirme için açık (gerektiğinde domain bazlı sıkılaştırılır).

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // PROD'da domain bazlı sıkılaştırın

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da olmayan alanları at
      forbidNonWhitelisted: false, // false: üretimde kullanıcı deneyimi için daha yumuşak
      transform: true, // payload -> DTO dönüştür
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('FireAlert Backend API')
    .setDescription('NestJS uygulama katmanı için Swagger dokümantasyonu (contract-first ile hizalı).')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend running at http://localhost:${port} (Swagger: /docs)`);
}
bootstrap();
