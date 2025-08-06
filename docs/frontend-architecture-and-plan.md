# FireAlert Frontend Mimarisi, Cache & İndeksleme Tasarımı ve Uygulama Planı

Bu doküman, FireAlert mobil uygulaması (Expo/React Native) için uçtan uca mimariyi, cache ve indeksleme stratejilerini, teknoloji seçimlerinin gerekçelerini, DevOps sürecini ve adım adım uygulama planını içerir. Ücretsiz/OSS önceliklidir ve her kararın "neden"i açıklanmıştır.

---

## 1) Mimari Yaklaşım ve Nedenleri

İlkeler
- Harita-merkezli deneyim: Pan/zoom sırasında akıcılık, cluster ve zoom-level optimizasyonu
- Gerçek zamanlı + offline tolerant: Son bilinen verilerle çalışabilme, bağlantı geldiğinde otomatik senkronizasyon
- Modüler ve test edilebilir: Ayrık sorumluluklar, mock’lanabilir servis katmanları, test piramidi (unit/integration/e2e)
- Tip güvenliği ve sözleşme: TypeScript strict, OpenAPI contract-first
- Ücretsiz/açık kaynak odaklı: Startup/NGO bütçesi; vendor lock-in minimizasyonu; community avantajı

Temel Seçimler ve Kıyas
- Expo Managed Workflow
  - Neden: Hızlı geliştirme, OTA güncellemeler, EAS Build free tier, CI/CD kolaylığı
  - Alternatif: Bare RN (daha esnek ama başlangıç ve bakım maliyeti yüksek)
  - Karar: Managed başla, gerekirse Bare’a geçiş
- React 18.2.0
  - Neden: RN ekosisteminde stabil ve yaygın destek
  - Alternatif: React 19 (henüz RN’de tam olgun değil)
  - Karar: 18.2.0, 6 ay sonra 19 değerlendirme
- Redux Toolkit + RTK Query
  - Neden: Server state cache + invalidation + optimistic + polling + pagination tek çatı
  - Alternatifler: TanStack Query + Zustand (iki paradigma), Apollo/GraphQL (backend gerektirir)
  - Karar: RTKQ
- UI: react-native-paper (MD3)
  - Alternatif: NativeBase, React Native Elements
  - Karar: MD3 + olgunluk + TS desteği
- Harita: expo-maps (başlangıç) ⇄ react-native-maps (ihtiyaç halinde)
  - Neden: expo-maps ile OSM/MapLibre ücretsiz; RN Maps ile Google özellikleri
  - Karar: Ücretsiz/OSS odaklıysa expo-maps; özellik gerekir ise RN Maps
- Form/Validation: react-hook-form + zod (performans ve TS-first)
  - Alternatif: Formik + Yup
- İzinler: expo-camera, expo-location, expo-notifications
- Observability: Sentry free tier
- Test: Jest + React Native Testing Library

---

## 2) DevOps ve Süreç

Ortam Yönetimi (.env)
- development, staging, production
- API_BASE_URL, WS_URL, MAPS_API_KEY, SENTRY_DSN, LOG_LEVEL
- EAS Secrets ile production sırları

CI/CD (GitHub Actions + EAS)
- Lint, type-check, test
- PR preview publish (web), staging build, production build/submit
- Otomatize sürümleme ve kanal yönetimi

OpenAPI Contract-First
- openapi-typescript veya swagger-typescript-api ile tip üretimi
- Client generation (axios) opsiyonel
- Compile-time uyumsuzlukları yakalama

---

## 3) Veri Tasarımı, Cache ve İndeksleme

Hibrit Cache Stratejisi
- RTK Query: Hafızada parametre bazlı cache, invalidation, background revalidate, polling
- Redux Persist: auth ve settings gibi hafif slice’ların persist’i (reportsApi cache’i persist etme)
- Offline: NetInfo ile bağlantı durumu, snapshot ile son verileri gösterme

Alan & Metin İndeksleme
- Geo (H3): Her rapor/hotspot için H3 index (zoom’a göre çözünürlük)
- Cluster (Supercluster): Viewport’a göre marker yoğunluğunu cluster’la
- Metin (FlexSearch): Açıklama, kullanıcı adı, etiketler için yerel hızlı arama
- Zaman index’i: last 24/48/72h bucket (id listeleri), ekran filtreleri anlık

Tutarlılık
- RTK Query invalidation tags: ["Report", "Satellite", "Alert"]
- createReport/verify vb. olaylarda ilgili entity veya liste invalidation/patchQueryData

---

## 4) Realtime, Offline ve Dayanıklılık

Realtime (WebSocket)
- Exponential backoff, heartbeat/ping
- Event bus: “NEW_REPORT”, “REPORT_VERIFIED”, “CRITICAL_ALERT”
- RTKQ patchQueryData veya invalidation ile cache güncelle

Push Notifications
- Expo push token kaydı → backend
- Foreground/Background handler
- Tap → deep link navigasyonu

Offline Queue
- createReport, image upload gibi aksiyonlar idempotency key ile kuyruğa alınır
- Ağ geldiğinde retry/backoff ile yürütülür
- Başarısızlıklarda kullanıcıya net geri bildirim

---

## 5) Ekran Mimarisı ve UX Akışları

Navigation
- Root: AuthStack + MainTabs + Modals (CreateReport, ReportDetail)
- Deep linking: notification tap ile hedef ekran

Harita (Ana odak)
- Kullanıcı konumu, clusterlı marker’lar, risk legend
- Zaman filtresi (24/48/72h)
- Pan/zoom debounce ile bbox param güncelleme

Raporlar
- List/Detail: yakınlık + zaman + metin araması (FlexSearch)
- Create: kamera/galeri → konum → açıklama → upload → progress → sonuç

Uyarılar
- Unread badge, kritik olaylarda banner/snackbar
- Tap → haritada konuma git

Ayarlar
- Dil/tema, konum doğruluğu, bildirim tercihleri; geliştirici menüsü (cache temizle, ws test)

---

## 6) Güvenlik ve İzin UX’i

- Token: SecureStore + in-memory cache, kısa ömürlü access + refresh flow
- İzin UX: Rationale ekranı; reddedilirse “Ayarlar’a git” CTA; graceful degrade
- Hata stratejisi: Global error boundary, API error mapper (401/403/429), sade mesajlar

---

## 7) Tema, Erişilebilirlik ve i18n

- MD3 tema: FireAlert renk paleti (risk seviyeleri için tonlar)
- Erişilebilirlik: a11yLabel, minimum touch target, dinamik font/kontrast
- i18n: tr/en (i18next); varsayılan dil tr, fallback tr

---

## 8) Test Stratejisi

- Unit: utils, hooks, reducers
- Integration: ekran + RTKQ etkileşimleri
- E2E: kritik akışlar (Auth, Map load, Create Report)
- Jest + RTL; Detox ile smoke e2e

---

## 9) İzleme ve Loglama

- Sentry: crash ve performans (free tier)
- Özel logger: dev/prod seviye; prod’da analitik breadcrumb gönderimi
- Runbook: “Harita marker yok” → ws, cache, index kontrol listesi

---

## 10) Deployment ve Konfigürasyon

- EAS build profilleri: development/staging/production
- app.config.ts ile environment-temelli bundle id ve package name
- Ücretsiz/OSS öncelikli: Sentry, GitHub Actions, FCM/APNs (Expo push), OSM/MapLibre (expo-maps)

---

## 11) Alternatif Teknolojiler ve Karar Gerekçeleri

- RTK Query vs TanStack Query + Zustand
  - RTKQ tekleştirir, öğrenme/bakımı azaltır; TanStack Query güçlü ama iki paradigma yönetimi gerektirir
- expo-maps vs react-native-maps
  - Ücretsiz ve managed uyumluysa expo-maps; Google servislerine ihtiyaç varsa RN Maps
- RHF+zod vs Formik+Yup
  - RHF performans; zod TS-first; Formik olgun ama re-render fazla
- Paper vs NativeBase/Elements
  - Paper MD3 ve olgun; diğerleri de güçlü ama ihtiyaçlarımıza Paper uyuyor

---

## 12) Uygulama Planı (Sprint Bazlı)

Sprint 0 – Altyapı ve Sözleşme (2-3 gün)
- React 18.2.0, TS strict, ESLint/Prettier
- OpenAPI tip üretimi (contract-first)
- axios instance + interceptors (refresh, retry)
- RTK store + RTKQ baseApi
- Provider + NavigationContainer + PaperProvider + Theme
- .env, app.json izinleri, EAS Secrets
- NetInfo, Sentry temel kurulum

Sprint 1 – Harita ve Veri Katmanı (1 hafta)
- reports.getNearby + satellite.getNearby (bbox, time window) RTKQ
- H3 index + Supercluster; pan/zoom debounce
- Harita ekranı; background revalidate
- Redux Persist ile snapshot; offline banner

Sprint 2 – Raporlama Akışı (1 hafta)
- Create Report: kamera/galeri, konum, açıklama
- Upload kuyruğu + progress + idempotent işlemler
- List/Detail: entity normalization + FlexSearch arama

Sprint 3 – Uyarılar ve Realtime (1 hafta)
- WS client; ALERT_NEW, REPORT_UPDATED eventleri
- Push token kaydı, handler, deep link navigasyonu
- Cache invalidation/patch stratejileri

Sprint 4 – Stabilizasyon ve Erişilebilirlik (4-5 gün)
- Performans profili: Map/List render optimizasyonu
- A11y, i18n, tema; error boşlukları ve edge case’ler
- Testler, prod build dry-run; crash-free iyileştirme

---

## 13) Riskler ve Azaltım

- React 19 uyumsuzlukları: 18.2.0 kullan, kütüphane matrisini sabitle
- Harita lisans/anahtar: expo-maps + OSM ile ücretsiz kal; ihtiyaçta Google’a geçiş planı
- Push farklılıkları: iOS/Android test matrisi, staging push config
- Offline karmaşıklığı: Minimum viable offline; kademeli geliştirme
- Büyük veri: Server tarafı ön filtre + client index (hibrit)

---

## 14) Öğrenme Notları (Neden & Nasıl)

- Hibrit cache (server + client) = performans + offline
- Contract-first = compile-time doğruluk ve hızlı entegrasyon
- RTKQ invalidation + WS patch = anlık ve tutarlı UI
- İzin UX’i ve error mapping = güvenilir deneyim
- Modüler yapı = sürdürülebilirlik, test edilebilirlik

---

## Bilinen Küçük İyileştirme Alanları (Doküman Notu)

- CI/CD örnek pipeline’da “expo publish” ve “eas build” adımları birlikte verilmiştir. Organizasyonunuza göre sadece “eas build” (native deploy) veya “expo publish” (OTA) tercihine karar verip sadeleştirmenizde fayda var.
- react-native-maps yerine expo-maps önerisi, ücretsiz ve managed uyum açısından yapılmıştır; Google servislerine bağımlı özellikler gerekirse RN Maps’e geçiş notu plan dahilinde tutulmalıdır.
- OpenAPI tip üretim aracı olarak “swagger-typescript-api” örneği verilmiştir; “openapi-typescript” veya “orval” ile de aynı hedefe ulaşılabilir. Takımın tercihiyle standartlaştırın.

---

Bu doküman, FireAlert’in harita-merkezli, gerçek zamanlı ve offline-tolerant doğasına uygun bir frontend mimarisini, ücretsiz/açık kaynak teknolojilerle, öğretici açıklamalarla ve uygulanabilir bir planla sunar.
