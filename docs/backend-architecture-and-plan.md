# FireAlert Backend Mimarisi, Supabase Şema, Veri Akışları ve Uygulama Planı

Bu doküman, FireAlert’in backend tarafını Supabase (PostgreSQL + Auth + Storage + Realtime) temelli olacak şekilde, ücretsiz/OSS ağırlıklı bir teknoloji yığınıyla tasarlar. Hedef; uydu verisi (FIRMS/VIIRS/MODIS) + kullanıcı raporları + gerçek zamanlı uyarıları güvenli, ölçeklenebilir ve maliyet-etkin bir mimariyle sunmaktır. Contract-first (OpenAPI) ve öğretici şekilde “neden”leriyle anlatılmıştır.

---

## 1) Mimari Yaklaşım ve Nedenleri

İlkeler
- Contract-first API: OpenAPI ile tip güvenliği, otomatik client tip üretimi
- Modüler katmanlar: Auth, Reports, Satellite, Alerts, Notifications, Admin
- Güvenlik: Kısa ömürlü access token, RLS (Row Level Security), rate limiting
- Gözlemlenebilirlik: Log/metric/trace; Sentry/OTel (uygulama katmanı)
- Ücretsiz/OSS odak: Supabase Free tier, açık kaynak araçlar

Temel Seçimler ve Kıyas
- Platform: Supabase (Postgres + Auth + Storage + Realtime)
  - Neden: Tamamen yönetilen Postgres, Auth, Storage ve Realtime ücretsiz seviyede başlangıç için yeterli; PostGIS uzantısı desteği ile geo-sorgular güçlü.
  - Alternatif: Firebase (kolay ama relational/geo tarafı kısıtlı), Planetscale + Auth0 (maliyet/karmaşıklık), kendi Postgres (operasyon yükü).
- Uygulama Katmanı: Node.js (NestJS tercih) + TypeScript
  - Neden: TS ile tip güvenliği, modüler yapı, test kolaylığı; Nest, yapılandırmayı hızlandırır.
  - Alternatif: Express (daha hafif ama boilerplate fazla), Go (performans yüksek ama ekip TS biliyorsa JS ekosistemi daha hızlı), Deno/Fresh (yeni).
- Kuyruk/Arkaplan İşleri: Supabase Functions + Edge Functions + Cron (alternatif: RabbitMQ/SQS, ancak ücretsiz ve yönetimsiz başlangıç için Functions yeterli).
- Dosya Depolama: Supabase Storage (görseller) + imzalı URL
- Realtime: Supabase Realtime (Postgres listen/notify temelli), WebSocket ile istemci
- Cache/CDN: Supabase Cache (deneysel) veya Cloudflare Cache (isteğe bağlı)
- İzleme: Sentry (free), OpenTelemetry (opsiyonel), Supabase dashboard

Karar Özeti
- Supabase: hızlı MVP, düşük operasyon maliyeti, PostGIS ile güçlü coğrafi sorgular
- NestJS: büyükleşen kod tabanı için okunaklı ve test edilebilir mimari
- Ücretsiz ve yönetilen servisleri tercih ederek maliyetleri minimumda tutma

---

## 2) Supabase Şema Tasarımı (PostgreSQL + PostGIS)

Uzantılar
- PostGIS: coğrafi tipler ve indeksler (geometry/geography, ST_Distance, ST_Contains, vb.)
- pgcrypto: idempotency key, güvenli token üretimi (opsiyonel)
- uuid-ossp: UUID üretimi

Tablolar ve İlişkiler

users (Supabase Auth ile uyumlu)
- id (uuid, PK) – Supabase auth.users ile eşleştirilir
- email (text, unique)
- name (text)
- phone (text, nullable)
- avatar_url (text, nullable)
- reliability_score (int, default: 50)
- total_reports (int, default: 0)
- verified_reports (int, default: 0)
- is_verified (boolean, default: false)
- created_at (timestamptz, default now())

fire_reports
- id (uuid, PK, default gen_random_uuid())
- user_id (uuid, FK -> users.id, index)
- description (text)
- images (text[]) – Storage dosya yolları (alternatif: ayrı tablo fire_report_images)
- location (geography(Point, 4326)) – PostGIS
- ai_confidence (int) – 0–100
- ai_detected (text[]) – örn: ['smoke','fire','vegetation']
- ai_risk_level (text enum: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL')
- status (text enum: 'PENDING'|'VERIFIED'|'FALSE_ALARM'|'RESOLVED', default 'PENDING')
- reported_at (timestamptz, default now())
- verified_at (timestamptz, nullable)
- emergency112_notified (boolean, default false)
- satellite_match_id (uuid, nullable, FK -> satellite_hotspots.id)
- indexes:
  - GIST/BRIN index on location (geography)
  - BTREE on reported_at, status

satellite_hotspots
- id (uuid, PK)
- source (text enum: 'NASA_FIRMS'|'MODIS'|'VIIRS')
- confidence (int)
- brightness (numeric)
- acquired_at (timestamptz)
- location (geography(Point, 4326))
- distance_to_nearest_report (numeric, nullable)
- metadata (jsonb)
- indexes:
  - GIST on location
  - BTREE on acquired_at

alerts
- id (uuid, PK)
- type (text enum: 'FIRE_ALERT'|'VERIFICATION'|'EMERGENCY'|'SYSTEM')
- title (text)
- body (text)
- data (jsonb) – reportId, riskLevel vs
- user_id (uuid, nullable) – kişisel uyarı ise
- created_at (timestamptz, default now())
- read_by (uuid[] nullable) – okuyan kullanıcılar (alternatif: alert_reads pivot)

push_tokens
- id (uuid, PK)
- user_id (uuid, index)
- expo_token (text, unique)
- platform (text enum: 'ios'|'android')
- created_at (timestamptz, default now())

report_images (opsiyonel, büyükleşirse)
- id (uuid, PK)
- report_id (uuid, FK -> fire_reports.id, index)
- path (text)
- created_at (timestamptz)

İzinler (RLS – Row Level Security)
- users: kullanıcı kendi satırlarını okuyup güncelleyebilsin (email, name, avatar) – admin policy ayrık
- fire_reports: kullanıcı kendi oluşturduğu raporları full yönetebilsin; public/anon okuma politikası use-case’e göre (ör. haritada anonim gösterim) sınırlı
- alerts: user_id eşleşiyorsa okuyabilsin, broadcast alert’ler public read olabilir
- push_tokens: sadece sahibi görebilsin

Neden PostGIS?
- “Near me” sorguları (ST_DWithin), mesafe hesaplama, bbox/polygon içinde arama, performanslı geo index
- FIRMS hotspot eşlemesi için bölgesel birleştirme

---

## 3) API Tasarımı (OpenAPI Contract-First)

Temel Endpoint’ler (v1)
- Auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
- Reports
  - GET /reports?bbox=&radius=&hours=&riskLevel=  (yakındaki raporlar + zaman filtresi)
  - GET /reports/mine
  - GET /reports/:id
  - POST /reports
  - PATCH /reports/:id  (status, description vb.)
  - DELETE /reports/:id
  - POST /reports/:id/images (pre-signed upload URL üretimi)
- Satellite
  - GET /satellite/nearby?bbox=&hours=
  - POST /satellite/ingest  (cron/job tetikler; protected)
- Alerts
  - GET /alerts
  - PATCH /alerts/:id/read
  - POST /alerts/broadcast  (admin)
- Notifications
  - POST /notifications/push-token  (expo token kayıt)
  - POST /notifications/test  (admin/dev)
- Realtime
  - WS /ws (alert, report status updates)

Sözleşme Yönetimi
- OpenAPI yaml/json tek kaynak
- Client tip üretimi (frontend) – openapi-typescript
- Backend tip/validator üretimi (opsiyonel) – zod-to-openapi veya class-validator + swagger

Neden Contract-First?
- Derleme zamanında uyumsuzluk yakalama
- UI/BE paralel geliştirilebilir
- API değişikliklerinin izlenebilir olması

---

## 4) Uydu Verisi Entegrasyonu (FIRMS/VIIRS/MODIS)

Yaklaşım
- Backend cron job (Supabase Scheduled/Edge Functions) ile FIRMS endpoint’lerinden veri çekimi
- Normalize et → satellite_hotspots tablosuna insert
- Geo indeksleri ayarla; acquired_at ve location’a göre sorgular hızlı
- Rapor eşleme (opsiyonel): Son X saat ve Y km içinde hotspot bul ve fire_reports.satellite_match_id güncelle

Neden Backend’te?
- Güvenlik: API key/token sızdırma riski olmaz
- Oran limit: Sunucu tarafında kontrollü cache/retry; client spam’ine karşı koruma
- Veriyi normalize ederek tutarlı şema ve sorgu performansı

---

## 5) İş Akışları ve Veri Akışları

Rapor Oluşturma
1) Client → POST /reports (description, location) → 201
2) Storage için imzalı URL üret → client görselleri yükler
3) Rapor kaydı DB’ye; event → Realtime → client’lara “NEW_REPORT”
4) AI Analiz (opsiyonel): Queue/Function tetikler → sonuç döner → rapor güncellenir (status/ai_* alanları) → “REPORT_UPDATED” event
5) Kritik risk → Alert + Push (expo token’ları üzerinden)

Uydu Verisi İşleme
1) Cron → FIRMS API → yeni kayıtları çek
2) Normalize → satellite_hotspots tablosu
3) Yakın raporlarla eşle → rapor satırlarına referans yaz
4) Realtime ile aktif client’lara “SATELLITE_REFRESH”

Uyarılar ve Push
- DB insert → trigger/Function → Expo push gönder
- Kullanıcı bazlı veya broadcast; deep link ile hedef ekrana yönlendirme

---

## 6) Güvenlik, Rate Limiting ve Uyumluluk

Kimlik Doğrulama
- Supabase Auth (email/password veya sosyal sağlayıcılar)
- Access token kısa ömür; refresh ile yenileme
- Mobilde tokenlar SecureStore’da; backend’de JWT doğrulama

RLS ve Politikalar
- users/fire_reports/alerts/push_tokens için satır bazlı erişim kontrolü
- Admin rolleri (auth rol/claim) – yönetim endpoint’leri koru

Rate Limiting
- Nginx/Cloudflare düzeyinde IP bazlı limit (ücretsiz planlarla basit kurallar)
- Uygulama düzeyinde basit rate limit middleware (Nest rate-limiter-flexible)

Girdi Doğrulama
- DTO + class-validator/zod; SQL injection’dan Postgres driver’ı korur ancak domain doğrulamaları katmanda olmalı

Audit Log
- İsteğe bağlı: Önemli işlemler için audit_logs tablosu (user_id, action, entity, timestamp, payload)

---

## 7) Realtime ve Event-Driven Model

- Supabase Realtime (logical replication) ile tablo değişiklikleri clientlara push
- Uygulama katmanında gerektiğinde WebSocket endpoint’i: işlenen özel event’ler (ör. CRITICAL_ALERT) için
- Event source mapping:
  - DB → Realtime → frontend reducer/cache patch
  - Function → push notification → deep link

---

## 8) Observability ve Loglama

- Sentry (Backend SDK) – exception ve transaction tracing
- Structured logs (pino/winston) – JSON format
- Supabase dashboard – sorgu planları, index kullanımı
- Sağlık uçları: /healthz, /readiness

---

## 9) DevOps, CI/CD ve Ortamlar

Ortamlar
- development: local Supabase (Docker) veya Supabase project (free)
- staging: ayrı Supabase projesi, izolasyon
- production: prod projesi; database planları büyüdükçe upgrade

CI/CD (GitHub Actions)
- Test (unit/integration), lint, type-check
- DB migration (Prisma/Kysely/Migra/Drizzle – tercih)
- Deploy: Edge Functions/Supabase Functions; NestJS API (Fly.io, Render free tier veya Supabase Functions ile lightweight servisler)

Secrets Yönetimi
- Supabase service role key ve anon key – GitHub Secrets
- FIRMS token – Secret; asla client’a verilmez
- JWT secret – Env/Secret store

---

## 10) Supabase RLS Örnek Politikalar (Yüksek Seviyede)

fire_reports
- ENABLE RLS;
- Policy: select for authenticated users where true (veya anon için anon gösterim alanları)
- Policy: insert for authenticated with user_id = auth.uid()
- Policy: update/delete only if user_id = auth.uid() OR role = 'admin'

alerts
- User-specific: select where user_id = auth.uid()
- Broadcast: select where user_id is null

push_tokens
- insert/select/update where user_id = auth.uid()

Not: Üretimde hassas veriler için kolon düzeyinde erişim kısıtları veya view’lar.

---

## 11) Alternatif Teknoloji Kararları ve Gerekçeler

Supabase vs Firebase
- Supabase: SQL/PostGIS gücü, RLS, open-source ekosistem
- Firebase: Kolay kurulum, ancak relational/geo zorlukları ve vendor lock-in
- FireAlert’te PostGIS ve SQL gücü → Supabase daha uygun

NestJS vs Express
- NestJS: modüler mimari, DI, testler, dekoratörler, swagger kolaylığı
- Express: hafif ama boilerplate fazla
- Ekip TS standardı istiyorsa NestJS uzun vadede bakım kolaylığı sağlar

Kuyruk: Supabase Functions vs RabbitMQ/SQS
- Functions: ücretsiz başlayın, basit cron/trigger için yeterli
- RabbitMQ/SQS: yüksek hacim ve kompleks akışlarda gerekebilir (ileride)

---

## 12) Uygulama Planı (Sprint Bazlı)

Sprint 0 – Şema ve Altyapı (2-3 gün)
- Supabase projesi kur; PostGIS etkinleştir
- Tablolar: users (profil), fire_reports, satellite_hotspots, alerts, push_tokens
- Indexler: GIST on location, acquired_at, reported_at
- RLS politikalarını tanımla (minimum viable)
- OpenAPI taslağına başla

Sprint 1 – Auth ve CRUD (1 hafta)
- NestJS iskeleti; DTO’lar ve validators
- Auth akışları: login/register/refresh/logout (Supabase Auth + JWT doğrulama)
- FireReport CRUD + pre-signed upload (Supabase Storage)
- Basic rate limiting + logging
- OpenAPI dokümantasyon

Sprint 2 – Uydu Entegrasyonu (1-1.5 hafta)
- FIRMS veri çekici (Scheduled Function/Cron)
- Normalize ve insert; hatalara karşı retry/backoff
- Yakın rapor eşleme (coğrafi join)
- GET /satellite/nearby endpoint’i

Sprint 3 – Realtime ve Bildirimler (1 hafta)
- Supabase Realtime abonelikleri; DB trigger → event
- Expo push token kayıt ve push gönderimi
- WS endpoint (gerekirse) ve event yayınlama

Sprint 4 – Güvenlik ve SRE (1 hafta)
- RLS sertleştirme, audit log (opsiyonel)
- Sentry ve metrikler; healthz/readiness
- Yük testi (k6), indeks tuning, sorgu optimizasyonu

Sprint 5 – Stabilizasyon ve Dokümantasyon (3-5 gün)
- OpenAPI finalize; örnekler
- Runbook (operasyon kılavuzu)
- Prod cut-over planı

---

## 13) Riskler ve Azaltım

- FIRMS API limitleri/değişiklikleri: Cache + retry, degrade gracefully
- Büyük veri hacmi: Zaman penceresi ve bbox ile server-side filtre; doğru index
- RLS karmaşıklığı: Başlangıçta minimal; kademeli sıkılaştırma ve test
- Push bildirimleri platform farkları: staging key’ler ve cihaz matrisiyle erken test
- Maliyet: Supabase free tier sınırları izleme; büyüdükçe uygun plan’a geçiş

---

## 14) Öğrenme Notları (Neden & Nasıl)

- PostGIS ile “yangın yakınımda mı?” sorusu milisaniyelerle yanıtlanır; client tarafındaki H3/cluster akışını backend’de güçlü bir geo temeli destekler.
- Contract-first yaklaşımı, frontend’te RTK Query ve type-gen ile kusursuz entegrasyon sağlar.
- Supabase, MVP süresini ciddi kısaltır; RLS, Auth ve Storage entegre geldiği için güvenlik ve veri bütünlüğü kolaylaşır.
- Event-driven yaklaşım (Realtime + Push), “erken uyarı” değer önerisini güçlendirir.

---

## Ek Notlar ve İyileştirmeler

- “fire_reports.images” alanı büyürse “report_images” pivot tablosuna geçmek iyi bir normalizasyon olur.
- “alerts.read_by” yerine “alert_reads (alert_id, user_id)” pivot ile daha esnek bir okuma takibi sağlanır.
- Idempotency için “idempotency_keys” tablosu eklenebilir (yüksek hacimli işlem güvenilirliği).
- Uzun vadede AI pipeline dış servisler (Vertex AI, Rekognition) ile entegre edilecekse, asenkron iş kuyruğu ve maliyet izleme gerekebilir.

---

Bu doküman, FireAlert’in backend’ini Supabase merkezli ve ücretsiz/OSS öncelikli bir yaklaşımla; veri modelinden güvenliğe, uydu entegrasyonundan realtime/bildirimlere kadar uçtan uca tanımlar. Frontend dokümanıyla birlikte contract-first geliştirme akışında, üretim kalitesine ulaşmak için somut ve uygulanabilir bir yol haritası sunar.
