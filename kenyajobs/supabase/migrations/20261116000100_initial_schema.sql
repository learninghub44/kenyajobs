-- JOBS HUB KENYA — complete database baseline
-- Source of truth: kenyajobs/lib/db.js on main (2026-11-16).
-- Safe to re-run: CREATE/ALTER/INDEX statements are idempotent.
-- Run in Supabase SQL Editor against the project's primary database.

BEGIN;

CREATE TABLE IF NOT EXISTS public.manual_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Worldwide',
  type TEXT DEFAULT 'Full-time',
  salary TEXT,
  description TEXT DEFAULT '',
  url TEXT NOT NULL,
  company_logo TEXT,
  company_website TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'Online Jobs',
  requirements TEXT DEFAULT '',
  responsibilities TEXT DEFAULT '',
  qualifications TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  education TEXT DEFAULT '',
  benefits TEXT DEFAULT '',
  application_instructions TEXT DEFAULT '',
  application_deadline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS qualifications TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS education TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS application_instructions TEXT DEFAULT '';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS application_deadline TEXT;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS package_code TEXT;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS package_price INTEGER;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS package_started_at TIMESTAMPTZ;
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS renewal_status TEXT NOT NULL DEFAULT 'not_applicable';
ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS source_submission_id BIGINT;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  category TEXT DEFAULT 'Career Advice',
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  author TEXT DEFAULT 'JOBS HUB KENYA',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_submissions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT DEFAULT 'Kenya',
  type TEXT DEFAULT 'Full-time',
  salary TEXT,
  description TEXT NOT NULL,
  requirements TEXT DEFAULT '',
  responsibilities TEXT DEFAULT '',
  qualifications TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  education TEXT DEFAULT '',
  benefits TEXT DEFAULT '',
  company_website TEXT,
  company_logo TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  application_deadline TEXT,
  application_url TEXT NOT NULL,
  application_instructions TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  job_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS job_submissions_status_created_idx ON public.job_submissions(status,created_at DESC);
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS package_code TEXT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS package_price INTEGER;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS package_duration_days INTEGER;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'awaiting_confirmation';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS qualifications TEXT DEFAULT '';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS education TEXT DEFAULT '';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS posting_link_id BIGINT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS submission_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS job_submissions_submission_key_idx ON public.job_submissions(submission_key) WHERE submission_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS job_submissions_ip_created_idx ON public.job_submissions(ip_hash,created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_submissions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  organiser TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT DEFAULT 'Other',
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  timezone TEXT DEFAULT 'Africa/Nairobi',
  venue TEXT,
  location TEXT DEFAULT 'Kenya',
  description TEXT NOT NULL,
  ticket_price TEXT,
  registration_url TEXT,
  poster_url TEXT,
  website TEXT,
  ip_hash TEXT,
  submission_key TEXT,
  package_code TEXT NOT NULL,
  package_price INTEGER NOT NULL,
  package_duration_days INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'awaiting_confirmation',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  event_id TEXT,
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS group_key TEXT;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS package_event_count INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS event_submissions_group_key_idx ON public.event_submissions(group_key);
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS submission_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS event_submissions_submission_key_idx ON public.event_submissions(submission_key) WHERE submission_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS event_submissions_ip_created_idx ON public.event_submissions(ip_hash,created_at DESC);
CREATE INDEX IF NOT EXISTS event_submissions_status_created_idx ON public.event_submissions(status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organiser TEXT NOT NULL,
  event_type TEXT DEFAULT 'Other',
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  timezone TEXT DEFAULT 'Africa/Nairobi',
  venue TEXT,
  location TEXT DEFAULT 'Kenya',
  description TEXT NOT NULL,
  ticket_price TEXT,
  registration_url TEXT,
  poster_url TEXT,
  website TEXT,
  package_code TEXT,
  package_price INTEGER,
  package_started_at TIMESTAMPTZ,
  package_expires_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  promotions_allowed INTEGER NOT NULL DEFAULT 0,
  promotions_used INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  renewal_status TEXT NOT NULL DEFAULT 'active',
  source_submission_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS events_source_submission_idx ON public.events(source_submission_id) WHERE source_submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_published_date_idx ON public.events(published,event_date);
CREATE INDEX IF NOT EXISTS events_expiry_idx ON public.events(package_expires_at) WHERE published=true;

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.job_posting_links (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_posting_links_active_idx ON public.job_posting_links(token_hash,expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT DEFAULT '',
  url TEXT NOT NULL,
  image_url TEXT,
  placement TEXT NOT NULL DEFAULT 'all',
  active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_job_cache (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_channel_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  whatsapp_channel_url TEXT NOT NULL DEFAULT 'https://whatsapp.com/channel/0029Vb9ItcdJf05hVwnE3w2C',
  telegram_channel_url TEXT NOT NULL DEFAULT 'https://t.me/+JN0rNZmNbGlkN2I0',
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
  telegram_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_queue BOOLEAN NOT NULL DEFAULT true,
  approval_required BOOLEAN NOT NULL DEFAULT true,
  kenya_enabled BOOLEAN NOT NULL DEFAULT true,
  africa_enabled BOOLEAN NOT NULL DEFAULT true,
  remote_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.social_channel_settings(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.job_distribution_queue (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','telegram')),
  category TEXT NOT NULL CHECK (category IN ('kenya','africa','remote')),
  payload JSONB NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','ready','posted','failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  posted_at TIMESTAMPTZ,
  UNIQUE (job_id,channel)
);

CREATE TABLE IF NOT EXISTS public.job_distribution_logs (
  id BIGSERIAL PRIMARY KEY,
  queue_id BIGINT NOT NULL REFERENCES public.job_distribution_queue(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS manual_jobs_source_submission_idx ON public.manual_jobs(source_submission_id) WHERE source_submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS manual_jobs_published_idx ON public.manual_jobs(published);
CREATE INDEX IF NOT EXISTS manual_jobs_expiry_idx ON public.manual_jobs(package_expires_at) WHERE published=true;
CREATE INDEX IF NOT EXISTS ads_active_placement_idx ON public.ads(active,placement);
CREATE INDEX IF NOT EXISTS live_job_cache_updated_idx ON public.live_job_cache(updated_at);
CREATE INDEX IF NOT EXISTS distribution_status_created_idx ON public.job_distribution_queue(status,created_at DESC);
CREATE INDEX IF NOT EXISTS distribution_channel_created_idx ON public.job_distribution_queue(channel,created_at DESC);
CREATE INDEX IF NOT EXISTS distribution_logs_queue_idx ON public.job_distribution_logs(queue_id,created_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_status_date_idx ON public.blog_posts(status,published_at DESC);

-- Public read is required for event posters; uploads are performed server-side
-- with SUPABASE_SERVICE_ROLE_KEY, which bypasses client-side RLS policies.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('event-posters', 'event-posters', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
