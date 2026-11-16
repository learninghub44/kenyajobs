import { Pool } from "pg";
const CONNECTION_STRING = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || "";
let pool;
function getPool() {
  if (!CONNECTION_STRING) throw new Error("No database connection string found. Set DATABASE_URL (or POSTGRES_URL) in your environment.");
  if (!pool) { const local = /localhost|127\.0\.0\.1/.test(CONNECTION_STRING); pool = new Pool({ connectionString: CONNECTION_STRING, ssl: local ? false : { rejectUnauthorized: false }, max: 5 }); }
  return pool;
}
let schemaReady = null;
async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS manual_jobs (
        id TEXT PRIMARY KEY,title TEXT NOT NULL,company TEXT NOT NULL,location TEXT DEFAULT 'Worldwide',
        type TEXT DEFAULT 'Full-time',salary TEXT,description TEXT DEFAULT '',url TEXT NOT NULL,
        company_logo TEXT,company_website TEXT,categories TEXT[] NOT NULL DEFAULT '{}',
        featured BOOLEAN NOT NULL DEFAULT false,published BOOLEAN NOT NULL DEFAULT true,
        source TEXT NOT NULL DEFAULT 'Online Jobs',requirements TEXT DEFAULT '',responsibilities TEXT DEFAULT '',
        qualifications TEXT DEFAULT '',experience TEXT DEFAULT '',education TEXT DEFAULT '',benefits TEXT DEFAULT '',
        application_instructions TEXT DEFAULT '',application_deadline TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS qualifications TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS education TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS application_instructions TEXT DEFAULT '';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS application_deadline TEXT;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS package_code TEXT;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS package_price INTEGER;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS package_started_at TIMESTAMPTZ;
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS renewal_status TEXT NOT NULL DEFAULT 'not_applicable';
      ALTER TABLE manual_jobs ADD COLUMN IF NOT EXISTS source_submission_id BIGINT;
      CREATE TABLE IF NOT EXISTS blog_posts (
        id BIGSERIAL PRIMARY KEY,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,excerpt TEXT DEFAULT '',
        category TEXT DEFAULT 'Career Advice',content TEXT NOT NULL,cover_image TEXT DEFAULT '',
        author TEXT DEFAULT 'JOBS HUB KENYA',status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
        published_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS job_submissions (
        id BIGSERIAL PRIMARY KEY,title TEXT NOT NULL,company TEXT NOT NULL,contact_name TEXT NOT NULL,email TEXT NOT NULL,
        location TEXT DEFAULT 'Kenya',type TEXT DEFAULT 'Full-time',salary TEXT,description TEXT NOT NULL,
        requirements TEXT DEFAULT '',responsibilities TEXT DEFAULT '',qualifications TEXT DEFAULT '',experience TEXT DEFAULT '',education TEXT DEFAULT '',benefits TEXT DEFAULT '',company_website TEXT,company_logo TEXT,categories TEXT[] NOT NULL DEFAULT '{}',application_deadline TEXT,application_url TEXT NOT NULL,
        application_instructions TEXT DEFAULT '',status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
        job_id TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),reviewed_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS job_submissions_status_created_idx ON job_submissions(status,created_at DESC);
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS package_code TEXT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS package_price INTEGER;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS package_duration_days INTEGER;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'awaiting_confirmation';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS qualifications TEXT DEFAULT '';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS education TEXT DEFAULT '';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS company_website TEXT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS company_logo TEXT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS posting_link_id BIGINT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT;
      ALTER TABLE job_submissions ADD COLUMN IF NOT EXISTS submission_key TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS job_submissions_submission_key_idx ON job_submissions(submission_key) WHERE submission_key IS NOT NULL;
      CREATE INDEX IF NOT EXISTS job_submissions_ip_created_idx ON job_submissions(ip_hash,created_at DESC);
      CREATE TABLE IF NOT EXISTS event_submissions (
        id BIGSERIAL PRIMARY KEY,title TEXT NOT NULL,organiser TEXT NOT NULL,contact_name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,
        event_type TEXT DEFAULT 'Other',event_date DATE NOT NULL,start_time TEXT,end_time TEXT,timezone TEXT DEFAULT 'Africa/Nairobi',
        venue TEXT,location TEXT DEFAULT 'Kenya',description TEXT NOT NULL,ticket_price TEXT,registration_url TEXT,poster_url TEXT,
        website TEXT,ip_hash TEXT,submission_key TEXT,package_code TEXT NOT NULL,package_price INTEGER NOT NULL,package_duration_days INTEGER NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'awaiting_confirmation',status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
        event_id TEXT,admin_notes TEXT DEFAULT '',created_at TIMESTAMPTZ NOT NULL DEFAULT now(),reviewed_at TIMESTAMPTZ
      );
      ALTER TABLE event_submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT;
      ALTER TABLE event_submissions ADD COLUMN IF NOT EXISTS submission_key TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS event_submissions_submission_key_idx ON event_submissions(submission_key) WHERE submission_key IS NOT NULL;
      CREATE INDEX IF NOT EXISTS event_submissions_ip_created_idx ON event_submissions(ip_hash,created_at DESC);
      CREATE INDEX IF NOT EXISTS event_submissions_status_created_idx ON event_submissions(status,created_at DESC);
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,title TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,organiser TEXT NOT NULL,event_type TEXT DEFAULT 'Other',
        event_date DATE NOT NULL,start_time TEXT,end_time TEXT,timezone TEXT DEFAULT 'Africa/Nairobi',venue TEXT,location TEXT DEFAULT 'Kenya',
        description TEXT NOT NULL,ticket_price TEXT,registration_url TEXT,poster_url TEXT,website TEXT,
        package_code TEXT,package_price INTEGER,package_started_at TIMESTAMPTZ,package_expires_at TIMESTAMPTZ,
        featured_until TIMESTAMPTZ,promotions_allowed INTEGER NOT NULL DEFAULT 0,promotions_used INTEGER NOT NULL DEFAULT 0,
        published BOOLEAN NOT NULL DEFAULT true,renewal_status TEXT NOT NULL DEFAULT 'active',
        source_submission_id BIGINT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS events_source_submission_idx ON events(source_submission_id) WHERE source_submission_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS events_published_date_idx ON events(published,event_date);
      CREATE INDEX IF NOT EXISTS events_expiry_idx ON events(package_expires_at) WHERE published=true;
      CREATE TABLE IF NOT EXISTS admin_login_attempts (ip_hash TEXT PRIMARY KEY,attempts INTEGER NOT NULL DEFAULT 0,window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),locked_until TIMESTAMPTZ);
      CREATE TABLE IF NOT EXISTS job_posting_links (
        id BIGSERIAL PRIMARY KEY,label TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,auto_publish BOOLEAN NOT NULL DEFAULT false,
        max_uses INTEGER NOT NULL DEFAULT 1,uses INTEGER NOT NULL DEFAULT 0,expires_at TIMESTAMPTZ,revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS job_posting_links_active_idx ON job_posting_links(token_hash,expires_at) WHERE revoked_at IS NULL;
      CREATE TABLE IF NOT EXISTS ads (
        id TEXT PRIMARY KEY,title TEXT NOT NULL,company TEXT,description TEXT DEFAULT '',url TEXT NOT NULL,
        image_url TEXT,placement TEXT NOT NULL DEFAULT 'all',active BOOLEAN NOT NULL DEFAULT true,
        priority INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS live_job_cache (id TEXT PRIMARY KEY,data JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS social_channel_settings (
        id INTEGER PRIMARY KEY CHECK(id=1),whatsapp_channel_url TEXT NOT NULL DEFAULT 'https://whatsapp.com/channel/0029Vb9ItcdJf05hVwnE3w2C',
        telegram_channel_url TEXT NOT NULL DEFAULT 'https://t.me/+JN0rNZmNbGlkN2I0',whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
        telegram_enabled BOOLEAN NOT NULL DEFAULT true,auto_queue BOOLEAN NOT NULL DEFAULT true,approval_required BOOLEAN NOT NULL DEFAULT true,
        kenya_enabled BOOLEAN NOT NULL DEFAULT true,africa_enabled BOOLEAN NOT NULL DEFAULT true,remote_enabled BOOLEAN NOT NULL DEFAULT true,updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      INSERT INTO social_channel_settings(id) VALUES(1) ON CONFLICT(id) DO NOTHING;
      CREATE TABLE IF NOT EXISTS job_distribution_queue (
        id BIGSERIAL PRIMARY KEY,job_id TEXT NOT NULL,channel TEXT NOT NULL CHECK(channel IN ('whatsapp','telegram')),
        category TEXT NOT NULL CHECK(category IN ('kenya','africa','remote')),payload JSONB NOT NULL,message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_approval' CHECK(status IN ('pending_approval','ready','posted','failed')),
        error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),posted_at TIMESTAMPTZ,
        UNIQUE(job_id,channel)
      );
      CREATE TABLE IF NOT EXISTS job_distribution_logs (
        id BIGSERIAL PRIMARY KEY,queue_id BIGINT NOT NULL REFERENCES job_distribution_queue(id) ON DELETE CASCADE,
        action TEXT NOT NULL,status TEXT NOT NULL,detail TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS manual_jobs_source_submission_idx ON manual_jobs(source_submission_id) WHERE source_submission_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS manual_jobs_published_idx ON manual_jobs(published);
      CREATE INDEX IF NOT EXISTS manual_jobs_expiry_idx ON manual_jobs(package_expires_at) WHERE published=true;
      CREATE INDEX IF NOT EXISTS ads_active_placement_idx ON ads(active,placement);
      CREATE INDEX IF NOT EXISTS live_job_cache_updated_idx ON live_job_cache(updated_at);
      CREATE INDEX IF NOT EXISTS distribution_status_created_idx ON job_distribution_queue(status,created_at DESC);
      CREATE INDEX IF NOT EXISTS distribution_channel_created_idx ON job_distribution_queue(channel,created_at DESC);
      CREATE INDEX IF NOT EXISTS distribution_logs_queue_idx ON job_distribution_logs(queue_id,created_at DESC);
      CREATE INDEX IF NOT EXISTS blog_posts_status_date_idx ON blog_posts(status,published_at DESC);
    `).catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}
export async function query(sql, params) { await ensureSchema(); return getPool().query(sql, params); }
export function isDatabaseConfigured() { return Boolean(CONNECTION_STRING); }
