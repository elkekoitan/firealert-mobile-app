// ReportsController (İskelet)
// Amaç: CRUD uçları ve presigned upload endpoint iskeleti.
// Not: JwtAuthGuard ile korunur; /mine ve write işlemleri için kimlik gerekir.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  // GET /reports?bbox=minLon,minLat,maxLon,maxLat&hours=24
  @Get()
  @ApiOperation({ summary: 'Raporları listele (bbox/hours filtreleri opsiyonel)' })
  @ApiQuery({ name: 'bbox', required: false, description: 'minLon,minLat,maxLon,maxLat' })
  @ApiQuery({ name: 'hours', required: false, description: 'Son X saat (default: 24)' })
  list(@Query('bbox') bbox?: string, @Query('hours') hours?: string) {
    const parsed = this.reports.parseListQuery(bbox, hours);
    return this.reports.list(parsed);
  }

  // GET /reports/mine
  @Get('mine')
  @ApiOperation({ summary: 'Aktif kullanıcının kendi raporları' })
  mine(@Req() req: any) {
    return this.reports.mine(req.user);
  }

  // GET /reports/:id
  @Get(':id')
  @ApiOperation({ summary: 'Rapor detay' })
  get(@Param('id') id: string) {
    return this.reports.get(id);
  }

  // POST /reports
  @Post()
  @ApiOperation({ summary: 'Rapor oluştur (iskelet)' })
  create(@Req() req: any, @Body() dto: any) {
    return this.reports.create(req.user, dto);
  }

  // PATCH /reports/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Rapor güncelle (iskelet)' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.reports.update(req.user, id, dto);
  }

  // DELETE /reports/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Rapor sil (iskelet)' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.reports.remove(req.user, id);
  }

  // POST /reports/:id/images (presigned)
  @Post(':id/images')
  @ApiOperation({ summary: 'Presigned upload URL üret (iskelet)' })
  presigned(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.reports.presigned(req.user, id, dto);
  }
}
