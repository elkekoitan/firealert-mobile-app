// Neden ConfigService?
// - Tüm modüllerin güvenilir biçimde okuduğu tek config kaynağı.
// - Env doğrulama (zod) ile eksik/yanlış değerleri erken yakalama.
// - Client vs Server anahtar ayrımı: SERVICE_ROLE yalnız server tarafında.

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 3000)),
  SUPABASE_URL: z.string().url(),
  // Frontend tarafında kullanılabilir; backend de okur (ör. bazı doğrulamalar için)
  SUPABASE_ANON_KEY: z.string().min(10),
  // Sadece backend/edge function için; client'ta asla kullanılmaz
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

  // JWKS/JWT doğrulama için opsiyonel yardımcı alanlar
  SUPABASE_PROJECT_REF: z.string().optional(), // ör: hddwvgvqxgbtajwhvqqs
  SUPABASE_JWT_ISS: z.string().url().optional(), // ör: https://<project>.supabase.co/auth/v1
  SUPABASE_JWT_AUD: z.string().optional(), // genelde 'authenticated'

  // Opsiyonel entegrasyonlar
  SENTRY_DSN: z.string().optional(),
  FIRMS_API_KEY: z.string().optional(),
  API_BASE_URL: z.string().optional(),
});

type Env = z.infer<typeof EnvSchema>;

@Injectable()
export class ConfigService {
  private readonly env: Env;

  constructor() {
    // process.env’den çek, şema ile doğrula
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      // Geliştirme deneyimi için okunabilir hata mesajı
      // eslint-disable-next-line no-console
      console.error('Environment validation error:', parsed.error.flatten().fieldErrors);
      throw new Error('Invalid environment configuration');
    }
    this.env = parsed.data;
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }
  get isProd(): boolean {
    return this.env.NODE_ENV === 'production';
  }
  get port(): number {
    return this.env.PORT as number;
  }
  get supabaseUrl(): string {
    return this.env.SUPABASE_URL;
  }
  get supabaseAnonKey(): string {
    return this.env.SUPABASE_ANON_KEY;
  }
  get supabaseServiceRoleKey(): string | undefined {
    return this.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  // JWKS/JWT yardımcı alanlar
  get supabaseProjectRef(): string | undefined {
    return this.env.SUPABASE_PROJECT_REF;
  }
  get supabaseJwtIss(): string | undefined {
    return this.env.SUPABASE_JWT_ISS;
  }
  get supabaseJwtAud(): string | undefined {
    return this.env.SUPABASE_JWT_AUD;
  }
  get sentryDsn(): string | undefined {
    return this.env.SENTRY_DSN;
  }
  get firmsApiKey(): string | undefined {
    return this.env.FIRMS_API_KEY;
  }
  get apiBaseUrl(): string | undefined {
    return this.env.API_BASE_URL;
  }
}
