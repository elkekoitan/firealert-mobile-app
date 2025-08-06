// ReportsService (İskelet)
// Amaç: Listeleme (bbox/hours), mine, get, create, update, delete, presigned akışlarının iskeleti.
// Not: DB erişimi ve RLS hizası ilerleyen iterasyonda eklenecek.

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';

export type ListQuery = {
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  hours?: number; // default 24
};

@Injectable()
export class ReportsService {
  parseListQuery(bbox?: string, hours?: string): ListQuery {
    const out: ListQuery = {};
    if (bbox) {
      const parts = bbox.split(',').map((v) => Number(v.trim()));
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
        throw new BadRequestException('Invalid bbox. Use minLon,minLat,maxLon,maxLat');
      }
      out.bbox = [parts[0], parts[1], parts[2], parts[3]];
    }
    out.hours = hours ? Number(hours) : 24;
    if (out.hours! <= 0 || Number.isNaN(out.hours)) {
      throw new BadRequestException('Invalid hours');
    }
    return out;
  }

  // GET /reports
  list(q: ListQuery) {
    // TODO: DB query (bbox + hours filtresi)
    return {
      ok: true,
      items: [],
      filter: q,
    };
  }

  // GET /reports/mine
  mine(user: any) {
    if (!user?.sub) throw new ForbiddenException('Auth required');
    // TODO: DB query (owner=user.sub)
    return { ok: true, owner: user.sub, items: [] };
  }

  // GET /reports/:id
  get(id: string) {
    // TODO: DB fetch by id
    return { ok: true, id, item: null };
  }

  // POST /reports
  create(user: any, dto: any) {
    if (!user?.sub) throw new ForbiddenException('Auth required');
    // TODO: DB insert (owner=user.sub), validate dto
    return { ok: true, created: { id: 'mock-id', owner: user.sub, ...dto } };
  }

  // PATCH /reports/:id
  update(user: any, id: string, dto: any) {
    if (!user?.sub) throw new ForbiddenException('Auth required');
    // TODO: owner check (RLS ile DB tarafında), DB update
    return { ok: true, updated: { id, owner: user.sub, ...dto } };
  }

  // DELETE /reports/:id
  remove(user: any, id: string) {
    if (!user?.sub) throw new ForbiddenException('Auth required');
    // TODO: owner check (RLS ile DB tarafında), DB delete
    return { ok: true, removed: { id } };
  }

  // POST /reports/:id/images
  presigned(user: any, id: string, dto: any) {
    if (!user?.sub) throw new ForbiddenException('Auth required');
    // TODO: Supabase Storage için presigned URL üretimi (service role sadece server)
    return {
      ok: true,
      id,
      upload: {
        url: 'https://example-upload-url',
        fields: { key: 'mock/object/key' },
      },
    };
  }
}
