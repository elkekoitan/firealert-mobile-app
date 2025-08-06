# FireAlert Backend (NestJS + TypeScript) – İskelet ve Rehber

Bu klasör, Supabase tabanlı FireAlert backend uygulamasının NestJS iskeletini içerir. Amaç: contract-first (OpenAPI), güvenli env yönetimi, modüler mimari, test edilebilirlik ve sürdürülebilirlik. Kod içinde neden bu teknoloji/kalıp tercih edildiğini açıklayan yorumlar bulunur.

## Neden NestJS?
- Modüler mimari: Büyüdükçe domain bazlı ayrışım (auth, reports, satellite, alerts, notifications)
- Guard/Interceptor/Filter/Pipe standartları: Kimlik doğrulama, logging, hata yönetimi ve validasyon için yeniden kullanılabilir yapı taşları
- Swagger/OpenAPI ve DTO validasyonu: Contract-first akışıyla uyumlu, CI’da sözleşme denetimi kolay
- TypeScript-first: Tip güvenliği, geniş ekosistem

Alternatifler: Express (hafif ama boilerplate fazla), Fastify (performanslı ama Nest uyarlanması gerekir). Kurumsal sürdürülebilirlik için Nest tercih edildi.

## Çalıştırma

1) Ortam değişkenlerini hazırlayın (repo kökündeki .env.example referansı).
   Yerel .env (repo-dışı veya .gitignore içinde):
   - SUPABASE_URL=https://hddwvgvqxgbtajwhvqqs.supabase.co
   - SUPABASE_ANON_KEY=... (mobil/istemci için)
   - SUPABASE_SERVICE_ROLE_KEY=... (sadece server-side)
   - SENTRY_DSN=... (opsiyonel)
   - FIRMS_API_KEY=... (opsiyonel, edge ingest için)

2) Kurulum ve Çalıştırma:
   - npm install
   - npm run start:dev

3) Swagger UI:
   - http://localhost:3000/docs (Swagger/OpenAPI, dev modda)

4) Test:
   - npm run test
   - npm run test:e2e
   - npm run lint

## Klasör Yapısı

- src/
  - main.ts             → Uygulama girişi, global pipes/filters, Swagger
  - app.module.ts       → Root module (modülleri toplar)
  - config/             → Env şeması ve config service (zod ile doğrulama)
  - common/
    - guards/           → JwtAuthGuard (Supabase JWT doğrulama)
    - interceptors/     → LoggingInterceptor (istek/yanıt loglama)
    - filters/          → HttpExceptionFilter (standart hata cevabı)
    - pipes/            → ValidationPipe (DTO validasyonu)
    - utils/            → Supabase client factory (service-role anahtarı sadece server)
  - modules/
    - auth/             → AuthModule (strategy/guard), current user çıkarımı
    - reports/          → ReportsModule (CRUD + presigned upload)
    - satellite/        → SatelliteModule (nearby bbox/hours)
    - alerts/           → AlertsModule (list/markRead/broadcast)
    - notifications/    → NotificationsModule (push token register)

## Güvenlik ve Env

- Client (mobil): Sadece ANON key kullanır. 
- Server (burada): SERVICE_ROLE_KEY sadece backend/edge ortamında kullanılır (presigned, ingest, admin).
- Presigned upload: Sunucu imzalar, client doğrudan Storage’a yükler (band genişliği/performans).
- Rate limiting: İlerleyen adımlarda middleware/guard ile eklenecek.
- RLS: Supabase tarafında etkin. Backend, RLS ile çakışmayacak şekilde user_id’yi JWT’den alır (auth.uid()).

## Sözleşme ve Tipler

- docs/openapi.yaml (repo kökünde) → contract-first
- Swagger decorators ile senkron tutulur; CI’da farklılıklar için openapi-diff kullanılabilir.

## Notlar

- Bu iskelet, secrets içermeden, env-tabanlı çalışır. Yerel .env dosyanızı doldurmayı unutmayın.
- Edge ingest (FIRMS) bu repoda sadece README ile belgelenmiştir; Supabase Functions’da çalıştırılır.
