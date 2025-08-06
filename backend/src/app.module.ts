// Neden AppModule?
// - NestJS'te kök modül tüm alt modülleri birleştirir.
// - Modüler mimari ile domainler ayrışır (auth, reports, satellite...).
// - Bu aşamada iskelet kuruyoruz; modüller ilerleyen adımlarda eklenecek.

import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    ReportsModule,
    // SatelliteModule,
    // AlertsModule,
    // NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
