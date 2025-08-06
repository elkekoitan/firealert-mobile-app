import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global prefix
  const globalPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (configService.get('ENABLE_SWAGGER', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('FireAlert API')
      .setDescription('API for FireAlert mobile application - Fire reporting and emergency alert system with real-time notifications')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and profile management')
      .addTag('Fire Reports', 'Fire incident reporting and verification')
      .addTag('Satellite Data', 'NASA FIRMS satellite hotspot data')
      .addTag('Alerts', 'Fire alerts and notifications')
      .addTag('Users', 'User management and statistics')
      .addTag('Notifications', 'Push notification management')
      .addTag('External APIs', 'External service integrations')
      .addServer(`http://localhost:${configService.get('PORT', 3000)}/${globalPrefix}`, 'Local development')
      .addServer(`https://api.firealert.com/${globalPrefix}`, 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });
    
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
      },
      customSiteTitle: 'FireAlert API Documentation',
    });

    // Export OpenAPI JSON for frontend type generation
    const fs = require('fs');
    const path = require('path');
    const openApiPath = path.join(process.cwd(), 'openapi.json');
    fs.writeFileSync(openApiPath, JSON.stringify(document, null, 2));
    logger.log(`📄 OpenAPI specification exported to: ${openApiPath}`);
    logger.log(`📚 API Documentation available at http://localhost:${configService.get('PORT', 3000)}/api/docs`);
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`🚀 FireAlert API is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});