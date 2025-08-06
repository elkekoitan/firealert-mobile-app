# Common Katmanı (guards, interceptors, filters, pipes, utils)

Bu klasör, uygulama genelinde kullanılan çapraz kaygıları (cross-cutting concerns) barındırır.

Neden ayrı bir katman?
- Tekrarlayan desenleri merkezi olarak yönetmek (DRY).
- Tutarlı loglama, hata yanıtlama (JSON), validasyon.
- Test edilebilirlik ve bakımı kolaylaştırma.

Bileşenler
- filters/http-exception.filter.ts: Tüm hataları tutarlı JSON şemasında döndürür.
- interceptors/logging.interceptor.ts: İstek başlangıç/bitiş ve durum kodu loglaması.
- (ileride) guards/jwt-auth.guard.ts: Supabase JWT doğrulaması (AuthModule ile birlikte).
- (ileride) pipes/validation.pipe.ts: DTO bazlı validasyon genişletmeleri.
- (ileride) utils/supabase.ts: Supabase client factory (service-role anahtarı yalnız server).

Notlar
- Prod ortamında log yoğunluğunu azaltmayı ve Sentry gibi araçlarla entegre etmeyi unutmayın.
