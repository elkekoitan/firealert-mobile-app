-- FireAlert - Supabase Initial Schema (PostgreSQL + PostGIS + RLS)
-- Bu migration, çekirdek şemayı, indeksleri ve minimum RLS politikalarını içerir.
-- NOT: PostGIS uzantısının etkin olduğu varsayılır. Değilse aşağıdaki satırların yorumunu kaldırın:
-- Enable required extensions (Supabase: SQL Editor'de ilk çalıştırmada etkinleştirin)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- 1) USERS (Supabase Auth ile uyumlu profil tablosu)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  name text,
  phone text,
  avatar_url text,
  reliability_score int DEFAULT 50,
  total_reports int DEFAULT 0,
  verified_reports int DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) FIRE REPORTS (PostGIS geography, AI & status alanları)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'fire_report_status'
  ) THEN
    CREATE TYPE fire_report_status AS ENUM ('PENDING','VERIFIED','FALSE_ALARM','RESOLVED');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'fire_risk_level'
  ) THEN
    CREATE TYPE fire_risk_level AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.fire_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description text,
  images text[] DEFAULT '{}',
  -- geography tipi PostGIS ile gelir. Eğer PostGIS etkin değilse önce EXTENSION'ı etkinleştirin.
  location geography(Point,4326) NOT NULL,
  ai_confidence int,
  ai_detected text[] DEFAULT '{}',
  ai_risk_level fire_risk_level,
  status fire_report_status NOT NULL DEFAULT 'PENDING',
  reported_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  emergency112_notified boolean DEFAULT false,
  satellite_match_id uuid,
  CONSTRAINT fire_reports_ai_confidence_range CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 100))
);

-- 3) SATELLITE HOTSPOTS (Uydu verisi)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'sat_source'
  ) THEN
    CREATE TYPE sat_source AS ENUM ('NASA_FIRMS','MODIS','VIIRS');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.satellite_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source sat_source NOT NULL,
  confidence int,
  brightness numeric,
  acquired_at timestamptz NOT NULL,
  location geography(Point,4326) NOT NULL,
  distance_to_nearest_report numeric,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 4) ALERTS (broadcast ve user-specific)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'alert_type'
  ) THEN
    CREATE TYPE alert_type AS ENUM ('FIRE_ALERT','VERIFICATION','EMERGENCY','SYSTEM');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_by uuid[] DEFAULT '{}'
);

-- 5) PUSH TOKENS (Expo push)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'platform_type'
  ) THEN
    CREATE TYPE platform_type AS ENUM ('ios','android');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expo_token text UNIQUE NOT NULL,
  platform platform_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) İNDEKSLER
-- Geo indexler
CREATE INDEX IF NOT EXISTS idx_fire_reports_location ON public.fire_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_satellite_hotspots_location ON public.satellite_hotspots USING GIST (location);

-- Zaman ve durum indexleri
CREATE INDEX IF NOT EXISTS idx_fire_reports_reported_at ON public.fire_reports (reported_at);
CREATE INDEX IF NOT EXISTS idx_fire_reports_status ON public.fire_reports (status);
CREATE INDEX IF NOT EXISTS idx_satellite_hotspots_acquired_at ON public.satellite_hotspots (acquired_at);

-- Yabancı anahtarlar (opsiyonel ilişki): satellite_match_id -> satellite_hotspots.id
ALTER TABLE public.fire_reports
  ADD CONSTRAINT fire_reports_satellite_fk
  FOREIGN KEY (satellite_match_id)
  REFERENCES public.satellite_hotspots(id)
  ON DELETE SET NULL;

-- 7) RLS (Row Level Security) Politikaları
-- RLS etkinleştirme
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_hotspots ENABLE ROW LEVEL SECURITY;

-- Helper policy için auth.uid() varsayımı: Supabase JWT context
-- USERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.users
      FOR SELECT
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      USING (id = auth.uid());
  END IF;
END
$$;

-- FIRE_REPORTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fire_reports' AND policyname='Public can read fire reports'
  ) THEN
    -- Harita anonim gösterim gerekiyorsa genel SELECT izni:
    CREATE POLICY "Public can read fire reports"
      ON public.fire_reports
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fire_reports' AND policyname='Users can insert own reports'
  ) THEN
    CREATE POLICY "Users can insert own reports"
      ON public.fire_reports
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fire_reports' AND policyname='Users can update own reports'
  ) THEN
    CREATE POLICY "Users can update own reports"
      ON public.fire_reports
      FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fire_reports' AND policyname='Users can delete own reports'
  ) THEN
    CREATE POLICY "Users can delete own reports"
      ON public.fire_reports
      FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- ALERTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='alerts' AND policyname='Public can read broadcast alerts'
  ) THEN
    CREATE POLICY "Public can read broadcast alerts"
      ON public.alerts
      FOR SELECT
      USING (user_id IS NULL OR user_id = auth.uid());
  END IF;

  -- insert/update/delete politikaları admin rol varsayımıyla daha sonra sıkılaştırılacaktır
END
$$;

-- PUSH_TOKENS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='push_tokens' AND policyname='Users manage own push tokens'
  ) THEN
    CREATE POLICY "Users manage own push tokens"
      ON public.push_tokens
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- SATELLITE_HOTSPOTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='satellite_hotspots' AND policyname='Public can read satellite'
  ) THEN
    CREATE POLICY "Public can read satellite"
      ON public.satellite_hotspots
      FOR SELECT
      USING (true);
  END IF;

  -- insert/update/delete sadece service role veya function ile yapılacak (RLS ile kısıtlı)
END
$$;

COMMIT;
