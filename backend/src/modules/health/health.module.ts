// HealthModule: HealthController'ı kapsüller ve AppModule'a import edilir.
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
