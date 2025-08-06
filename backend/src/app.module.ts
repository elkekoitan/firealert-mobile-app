import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { SatelliteModule } from './satellite/satellite.module';
import { AlertsModule } from './alerts/alerts.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { ExternalApisModule } from './external-apis/external-apis.module';
import { CommonModule } from './common/common.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
      envFilePath: [
        '.env.local',
        '.env.development',
        '.env.production',
        '.env',
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        ttl: configService.get('THROTTLE_TTL', 60),
        limit: configService.get('THROTTLE_LIMIT', 100),
      }],
    }),

    // Core modules
    CommonModule,
    DatabaseModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    ReportsModule,
    SatelliteModule,
    AlertsModule,
    NotificationsModule,
    
    // External integrations
    ExternalApisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}