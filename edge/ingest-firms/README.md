# Edge Function: FIRMS Ingest (Design, Nedenleri ve Kurulum Rehberi)

Bu belge, FireAlert için FIRMS/VIIRS/MODIS sıcak nokta verilerini Supabase tabanlı `satellite_hotspots` tablosuna ingest eden Edge Function için tasarım kararlarını, alternatifleri, kurulum ve çalışma notlarını içerir. Kod yazarken ve çalıştırırken neden böyle yaptığımızı ve hangi trade-off'ları gözettiğimizi açıklıyorum.

## Neden Edge Function?

- Güvenlik: FIRMS API anahtarı **client**'ta asla bulunmamalı. Edge Function, sunucu-yanı ortam değişkenlerini (Service Role key, FIRMS API key) güvenle kullanır.
- Maliyet ve Operasyon: Supabase Edge Functions ücretsiz başlamak için idealdir; cron (scheduled) tetikleme ile periyodik ingest kolaydır.
- Basitlik: Ayrı bir sunucu/worker kümesi yönetmek yerine, hafif ingest işini Edge üzerinde tutmak yeterli.

Alternatifler:
- Queue + Worker (SQS/RabbitMQ/Kafka): Yük arttığında veya karmaşık pipeline gerektiğinde düşünülür; başlangıçta gereksiz operasyon yükü.
- Dış sunucu (Render/Fly.io): Esneklik sağlar ama yönetim + maliyet artar.

## Mimari ve Veri Akışı

1) Cron (ör. her 1-2 saatte) Edge Function'ı tetikler.
2) Function, FIRMS API'dan son X saatlik veriyi çeker (parametrik).
3) Gelen veriyi normalize eder:
   - source: 'NASA_FIRMS' | 'MODIS' | 'VIIRS'
   - confidence, brightness, acquired_at
   - location (lat/lng → geography(Point, 4326))
   - metadata (orijinal ek alanlar)
4) `satellite_hotspots` tablosuna UPSERT eder (idempotent strateji).
5) Opsiyonel: Yakındaki raporlarla eşleştirip (ST_DWithin) `distance_to_nearest_report` alanını günceller.
6) Realtime event: Frontend’e “SATELLITE_REFRESH” bilgisi.

Performans ve idempotency:
- Zaman penceresi ile sınırla (örn. son 24 saat).
- `acquired_at` + `location` + `source` kombinasyonuyla doğal benzersizlik sağlanabilir (unique index düşünebilirsiniz).
- Batch insert (upsert) ile roundtrip sayısını azaltın.

## Ortam Değişkenleri

Aşağıdaki anahtarları **Edge Function ortamında** (Supabase Dashboard → Project Settings → Functions / Secrets) tanımlayın.

- `SUPABASE_URL` = https://YOUR-PROJECT.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = (sadece server-side)
- `FIRMS_API_KEY` = (varsa, FIRMS erişimi için)
- `FIRMS_BASE_URL` = https://firms.modaps.eosdis.nasa.gov/api (örnek)
- `FIRMS_TIME_WINDOW_HOURS` = 24 (varsayılan)
- `INGEST_BATCH_SIZE` = 500 (isteğe bağlı; performans tuning)

Not: `SUPABASE_ANON_KEY` client içindir; burada **kullanılmaz**.

## Çalışma Prensipleri ve Pseudocode

Neden bu yaklaşım?
- Idempotent UPSERT ile tekrar ingest durumlarında duplikasyon önlenir.
- Time-window ve sayfalama ile büyük veri setlerinde bellek ve ağ kullanımı kontrol edilir.
- Geo index (GIST) sayesinde `bbox` ve `hours` sorguları hızlıdır.

Pseudocode:

```
const timeWindow = env.FIRMS_TIME_WINDOW_HOURS || 24
const since = now - timeWindow

const pages = fetchFirmsPages({ since, apiKey: env.FIRMS_API_KEY })
for each page in pages:
  const normalized = page.items.map(toHotspotRow)
  upsert satellite_hotspots (on conflict: (source, acquired_at, location))
  if (enrichment):
    update distance_to_nearest_report using ST_Distance / ST_DWithin
emit realtime event: SATELLITE_REFRESH
```

Enrichment stratejisi:
- Her ingest turunda tüm satırları eşlemek pahalı olabilir. Alternatif:
  - Yalnızca yeni upsert edilen satırlar için eşleşme
  - Saatlik batch sonrasında tek bir `UPDATE` ile yakın rapor eşlemesi
  - Gerekirse bu adımı async ikinci bir function’a ayırın

## Güvenlik ve RLS

- `satellite_hotspots` tablosuna `INSERT/UPDATE` yalnızca **service role** veya Function içinde yapılmalı.
- RLS SELECT politikası “public read” olabilir, üretim gereksinimlerinize göre daraltın.
- API anahtarı ve service role key kesinlikle client tarafında kullanılmamalıdır.

## Hata Yönetimi ve İzleme

- Retry/Backoff: Ağ veya oran limit hatalarında exponential backoff ile yeniden dene.
- Sentry: Edge Functions'ta Sentry SDK ile exception logging (opsiyonel).
- Ölçüm: Her ingest turunda işlenen kayıt sayısı, başarısız istekler, latency.

## Kurulum Adımları (Özet)

1) Supabase Dashboard:
   - Functions/Secrets: yukarıdaki env’leri ekleyin
   - Edge Function deploy: (Kod eklendiğinde) `supabase functions deploy ingest-firms`
   - Scheduled trigger: cron ifadesiyle (örn. `0 */1 * * *` saat başı)

2) Şema:
   - `supabase/migrations/0001_init.sql`’i uygulayın (PostGIS + tablo + RLS + index)

3) OpenAPI:
   - `docs/openapi.yaml` ile `/satellite/nearby` sözleşmesi hazır; frontend tip jenerasyonu için kullanın.

## Alternatifler ve Trade-off’lar

- **Doğrudan Client → FIRMS**: Güvenlik ve oran limitlerinden dolayı tercih edilmedi.
- **Tam Queue/Worker (SQS/RabbitMQ)**: Yük artışı ve işlem karmaşıklığı olduğunda uygun; ilk aşamada Edge Function yeterli.
- **Batch Boyutu**: Küçük batch düşük bellek, çok istek; büyük batch hızlı ama memory/spike riski. Ortamınıza göre `INGEST_BATCH_SIZE` ayarlayın.

## Sonraki Adımlar

- Bu README’yi temel alarak function kodunu yazarken:
  - Ortam değişkenlerini sadece `process.env` üzerinden referans verin.
  - Service Role key’i yalnız function ortamında kullanın.
  - Upsert için conflict target: `(source, acquired_at, location)` veya benzersiz (hash) kolon (örn. md5(source+acquired_at+lat+lng)).
  - Büyük objelerde `metadata` alanını JSONB olarak saklayın.

Bu doküman, üretim odaklı ancak ücretsiz/OSS öncelikli bir ingest akışı kurmanıza rehberlik eder. İlk denemelerde küçük bir zaman penceresi (ör. 6-12 saat) ile başlayıp performansı ölçmeniz önerilir.
