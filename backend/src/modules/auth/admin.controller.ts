// AdminController
// /admin/ping: AdminGuard ile korunan basit kontrol ucu.
// Akış: JwtAuthGuard → AdminGuard → 200 OK

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  @Get('ping')
  @ApiOperation({ summary: 'Admin ping (korumalı)' })
  ping(@Req() req: any) {
    return {
      ok: true,
      message: 'admin-pong',
      user: req.user,
      ts: new Date().toISOString(),
    };
  }
}
