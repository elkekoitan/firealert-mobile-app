# 🔥 FireAlert Backend – PRD & Progress Tracker

Supabase (PostgreSQL + Auth + Storage + Realtime) temelli, PostGIS destekli, sözleşme (OpenAPI) odaklı backend geliştirme için Ürün Gereksinim Dokümanı ve Mimari İlerleme Takip Sistemi.

---

## 📋 Product Overview (Backend)

### Vision
Kullanıcı raporları ve uydu verilerini güvenli, ölçeklenebilir, düşük maliyetli ve gerçek zamanlı olarak sunan güçlü bir backend.

### Mission
- 🧭 Coğrafi sorgularla “yakınımdaki yangınlar” bilgisini hızlı sunmak
- 🛰️ FIRMS/VIIRS/MODIS verilerini normalize edip ilişkilendirmek
- 🧑‍🚒 Kullanıcı raporlarını saklamak, doğrulamak ve puanlamak
- 🔔 Realtime ve push bildirim altyapısını işletmek

### Success Metrics
- API p95 latency < 250ms (yakınlık sorgularında < 400ms)
- 99.9% uptime (Free tier sınırı dahilinde)
- Realtime event teslimi < 2s
- FIRMS ingest hatası < %1 (retry/backoff ile)

---

## 🎯 Core Features & Requirements

### 1) Authentication & Authorization
Priority: P0 | Status: 🔴 Not Started

Requirements
- [ ] Supabase Auth (email/password; sosyal login P1)
- [ ] JWT doğrulama (backend)
- [ ] RLS (Row Level Security) politikaları
- [ ] Role/claim tabanlı admin korumaları

Acceptance Criteria
- Kayıt, giriş, refresh/çıkış akışları çalışır
- RLS ile satır bazlı güvenlik etkin
- Protected endpoint’ler role/claim ile sınırlı

---

### 2) Fire Reports Service (Geo-enabled)
Priority: P0 | Status: 🔴 Not Started

Requirements
- [ ] PostGIS geography(Point, 4326) alanı
- [ ] Yakınlık/time-window filtreli listeleme (bbox/radius/hours)
- [ ] Rapor oluşturma/düzenleme/silme
- [ ] Pre-signed upload (Supabase Storage)
- [ ] İndeksler (GIST, reported_at)

Acceptance Criteria
- bbox+hours ile < 400ms p95 cevap
- İmzalı URL akışı güvenli ve idempotent
- RLS ile sadece sahibi raporunu değiştirir (admin hariç)

---

### 3) Satellite Ingestion & Query (FIRMS/VIIRS/MODIS)
Priority: P0 | Status: 🔴 Not Started

Requirements
- [ ] Edge Function cron ile ingest (normalize, upsert)
- [ ] satellite_hotspots tablosu (PostGIS + index)
- [ ] Yakınlık ve zaman penceresi sorguları
- [ ] Raporlar ile coğrafi eşleştirme (opsiyonel enrichment)

Acceptance Criteria
- Ingest job saatlik çalışır, idempotent ve dayanıklı
- nearby endpoint’i parametrelerle hızlı sonuç döndürür
- Veri modelinde acquired_at ve location indeksli

---

### 4) Alerts & Notifications
Priority: P0 | Status: 🔴 Not Started

Requirements
- [ ] alerts tablosu (broadcast ve user-specific)
- [ ] push_tokens kaydı (expo token)
- [ ] CRITICAL alert’lerde push + realtime
- [ ] Deep link metadata

Acceptance Criteria
- Token kayıt akışı güvenli ve idempotent
- Kritik uyarılar push + realtime ile <10s teslim
- read/unread izlenebilir

---

### 5) Realtime & Event Model
Priority: P1 | Status: 🔴 Not Started

Requirements
- [ ] Supabase Realtime (DB değişiklikleri)
- [ ] Özel WS kanalı (gerekirse)
- [ ] Event tipleri: NEW_REPORT, REPORT_UPDATED, CRITICAL_ALERT, SATELLITE_REFRESH
- [ ] RTKQ ile uyumlu cache patch/invalidate semantiği

Acceptance Criteria
- DB > Realtime <2s gecikme
- Event’ler sözleşmeye uygun payload ile gelir

---

### 6) Security, SRE & Observability
Priority: P0 | Status: 🔴 Not Started

Requirements
- [ ] RLS politikaları (minimum viable → sertleştirme)
- [ ] Rate limiting (Cloudflare/Nginx veya app-level)
- [ ] Sentry backend entegrasyonu
- [ ] Sağlık uçları: /healthz, /readiness

Acceptance Criteria
- RLS testleri geçer (pozitif/negatif)
- Temel rate limit aktif (DoS azaltma)
- Sentry’de exception ve transaction izlenebilir

---

## 🧱 Technical Architecture (Snapshot)

- Platform: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Geo: PostGIS (geography, GIST indeks)
- API: Node.js + NestJS (TS), OpenAPI (contract-first)
- Functions: Supabase Edge Functions (ingest, cron)
- Auth: Supabase JWT, kısa ömürlü access + refresh
- Storage: Supabase Storage (pre-signed upload)
- Realtime: Supabase Realtime (logical replication)
- Monitoring: Sentry (free), structured logs
- CI/CD: GitHub Actions (test, lint, type-check, deploy)
- Secrets: GitHub Secrets (service role key, FIRMS token)

---

## 📊 Progress Tracking

Overall Progress: 15% Complete

```
�🔴🔴🔴🔴🔴🔴🔴🔴 0/10 Major Components
```

---

## 📅 Phases & Tasks

Status Update (Phase 1)
- Supabase migration 0001_init.sql uygulandı: Success. No rows returned
- PostGIS ve uuid-ossp uzantıları etkinleştirildi (CREATE EXTENSION)
- Şema, indeksler ve minimal RLS oluşturuldu
- OpenAPI v1 taslağı eklendi (docs/openapi.yaml)

### Phase 1: Foundation & Schema
Target: Week 1 | Status: � | Progress: 0/10

1.1 Supabase Project & Extensions
- [ ] Supabase project (dev/stage/prod)
- [ ] PostGIS enable
- [ ] uuid-ossp, pgcrypto (opsiyonel)

1.2 Schema & Indexes
- [ ] users (profil alanları)
- [ ] fire_reports (geography point, status/ai)
- [ ] satellite_hotspots (acquired_at + geo)
- [ ] alerts, push_tokens
- [ ] GIST indexler (location), BTREE (acquired_at/reported_at)

1.3 RLS & Policies
- [ ] Minimum viable RLS
- [ ] Owner-only update/delete
- [ ] Broadcast vs user-specific alerts
- [ ] push_tokens owner-only

1.4 OpenAPI Draft
- [ ] v1 endpoints taslağı
- [ ] Types ve örnek payload’lar
- [ ] Frontend ile paylaşım

Criteria
- ✅ Şema ve RLS uygulanmış
- ✅ OpenAPI taslak hazır
- ✅ Indeks planı çalışır

---

### Phase 2: Auth & Reports CRUD
Target: Week 2 | Status: 🔴 | Progress: 0/10

2.1 Auth
- [ ] Supabase Auth entegrasyonu
- [ ] JWT doğrulama middleware
- [ ] Refresh akışı

2.2 Reports
- [ ] POST /reports (create)
- [ ] GET /reports?bbox=&hours=
- [ ] GET /reports/mine
- [ ] GET /reports/:id
- [ ] PATCH/DELETE /reports/:id

2.3 Storage
- [ ] POST /reports/:id/images (pre-signed)
- [ ] Upload callback (opsiyonel sync)

Criteria
- ✅ CRUD + pre-signed akış işliyor
- ✅ RLS ile güvenli
- ✅ OpenAPI güncel

---

### Phase 3: Satellite Ingestion
Target: Week 3 | Status: 🔴 | Progress: 0/8

3.1 FIRMS Integration
- [ ] Edge Function + cron
- [ ] Normalize + upsert
- [ ] Retry/backoff + rate limit

3.2 Satellite Query
- [ ] GET /satellite/nearby?bbox=&hours=
- [ ] Rapor eşleme (opsiyonel enrichment)
- [ ] Index tuning

Criteria
- ✅ Ingest saatlik çalışır
- ✅ nearby endpoint düşük gecikmede
- ✅ Hatalar Sentry’de görünür

---

### Phase 4: Realtime & Notifications
Target: Week 4 | Status: 🔴 | Progress: 0/8

4.1 Realtime
- [ ] Realtime abonelikleri
- [ ] Event payload standardı
- [ ] WS (gerekliyse)

4.2 Notifications
- [ ] POST /notifications/push-token
- [ ] CRITICAL alert push + realtime
- [ ] Deep link metadata

Criteria
- ✅ Realtime event <2s
- ✅ Push teslim <10s
- ✅ Deep link sözleşmesi net

---

### Phase 5: Security & SRE
Target: Week 5 | Status: 🔴 | Progress: 0/8

5.1 Security
- [ ] RLS sertleştirme
- [ ] Rate limit (Cloudflare/Nginx/app-level)
- [ ] DTO validation (class-validator/zod)

5.2 SRE
- [ ] Sentry (backend)
- [ ] Structured logs
- [ ] /healthz, /readiness

Criteria
- ✅ Rate limit aktif
- ✅ Sentry event’leri işliyor
- ✅ Health checks hazır

---

## 🚨 Current Blockers & Risks

High Priority
1. FIRMS API anahtarları ve limitleri
   - Mitigation: Secrets + retry/backoff + cache
2. RLS yanlış yapılandırma riski
   - Mitigation: Ayrı RLS testleri, minimal → kademeli sıkılaştırma

Medium Priority
1. Realtime event yükü artışı
   - Mitigation: Event’leri minimal payload ile gönder, gerekirse özel WS
2. Büyük veri hacmi (uydu)
   - Mitigation: Zaman penceresi/bbox zorunlu, doğru index, arşivleme stratejisi

---

## 🔧 DevOps & CI/CD

- GitHub Actions
  - Test, lint, type-check
  - Edge Functions deploy (ingest)
  - API deploy (Render/Fly.io free)
- Secrets
  - Supabase service role key, anon key, FIRMS token
- Environments
  - dev/stage/prod Supabase projeleri
- Migrations
  - Supabase SQL migration (alternatif: Drizzle/Prisma)

---

## 📄 Contract-First: OpenAPI

- v1 Taslak Kapsam
  - /auth: register, login, refresh, logout
  - /reports: list (bbox/hours/risk), mine, get, create, update, delete
  - /reports/:id/images: pre-signed
  - /satellite/nearby: bbox/hours
  - /satellite/ingest: protected
  - /alerts: list, markRead, broadcast (admin)
  - /notifications/push-token

- Tip Jenerasyonu
  - Frontend: openapi-typescript
  - Backend: swagger + decorators veya zod-to-openapi

---

## 📈 Progress Visualization

```
Foundation & Schema    �🔴🔴🔴🔴🔴🔴🔴🔴🔴 0%
Auth & Reports CRUD    🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 0%
Satellite Ingestion    🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 0%
Realtime & Notify      🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 0%
Security & SRE         🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 0%
```

Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⚪ Blocked
- 🔵 Under Review

---

## 🗓️ Sprint Planning

Current Sprint: Phase 1 – Foundation & Schema (1 Week)
Backlog
- [x] Supabase projeleri ve uzantılar
- [x] Şema ve indeksler
- [x] Minimum RLS
- [x] OpenAPI taslak

Definition of Done
- Şema/Index/RLS uygulanmış
- OpenAPI taslak yayınlanmış
- CI pipeline temel adımlar çalışır

---

## 🧪 Quality Metrics

- Coverage (unit/integration): ≥ 70% (kritik modüller)
- P95 latency: < 250ms (yakınlık sorgularında < 400ms)
- Error rate: < 1% (5xx)
- Ingest job success: ≥ 99%

---

## 🧭 Next Actions (Immediate)

Status (Snapshot)
- Backend Dev Server: UP (http://localhost:3000)
- Health: OK (GET /healthz)
- Auth: JwtAuthGuard (JWKS doğrulama) aktif, /auth/me guard’lı; AdminGuard ve /admin/ping (korumalı) eklendi
- Reports: CRUD iskeleti ve presigned endpoint eklendi (guard’lı)
- Next: Reports DB/RLS entegrasyonu, presigned gerçek Supabase Storage akışı, CI + vercel.json

Upcoming Milestones (Short)
1) Reports + DB
   - Supabase veri erişimi, RLS ile hizalı CRUD
   - bbox/hours sorguları için SQL ve index kullanımı
2) Storage (Presigned)
   - Supabase Storage ile gerçek presigned URL üretimi (service_role sadece server)
3) CI & Deploy
   - supabase/cli (docker) ile migrations/functions
   - vercel.json ve Preview/Prod akışı
4) Auth finalize
   - /auth/me payload alanlarının netleştirilmesi
   - admin token ile /admin/ping e2e testi

1. Supabase dev projesi ve PostGIS’i etkinleştir
2. Şema migration’larını yaz ve uygula
3. Minimum viable RLS’i aktive et
4. OpenAPI v1 taslağını oluştur ve paylaş
5. CI’de lint/type-check/test işlemlerini çalıştır

---

Bu PRD ve Progress Tracker her sprint sonunda güncellenecektir. Frontend PRD ile uyumlu olarak, contract-first akışıyla geliştirme sürdürülecektir.
