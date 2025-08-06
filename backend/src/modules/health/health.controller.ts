// Neden health endpoint?
// - Vercel/monitoring için hızlı canlılık kontrolü (liveness).
// - Basit, bağımsız ve cachelenmeyen yanıt.

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('healthz')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check (liveness)' })
  health() {
    return {
      ok: true,
      service: 'firealert-backend',
      ts: new Date().toISOString(),
    };
  }
}
