# Deployment Overview (Visual & Short)

Hedef Mimari (Prod)
- App Layer: NestJS (Vercel Serverless)
- DB/Auth/Storage/Realtime: Supabase
- Ingest: Supabase Edge Functions (cron)
- CI: GitHub Actions + Supabase CLI
- Preview: Vercel Preview deployments (PR bazlı)

Akış Diyagramı
1) Git Push → GitHub Actions
2) CI: build/test → Supabase (migrations/functions) → Vercel deploy
3) Kullanıcı → Vercel (API) → Supabase (DB/RLS/Storage)

Env (Prod/Preview)
- SUPABASE_URL
- SUPABASE_ANON_KEY (client)
- SUPABASE_SERVICE_ROLE_KEY (server)
- SENTRY_DSN (opsiyonel)
- FIRMS_API_KEY (opsiyonel)
- API_BASE_URL

Komutlar (Kısa)
- Supabase bağla: supabase link --project-ref hddwvgvqxgbtajwhvqqs
- Migration uygula (CI): supabase db push
- Function deploy: supabase functions deploy ingest-firms
- Vercel: GitHub bağlı → otomatik deploy (Preview/Prod)

Notlar
- Swagger /docs prod’da opsiyonel: basic auth ile koru.
- Client’ta sadece ANON key; service_role sadece server/edge.
