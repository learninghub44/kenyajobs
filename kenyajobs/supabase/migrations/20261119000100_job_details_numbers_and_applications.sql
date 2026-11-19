-- JOBS HUB KENYA - job reference numbers, structured job details and
-- in-platform applications. Idempotent; safe to re-run.
--
--  * every manual job gets a stable human-readable number (JH-1001, ...)
--  * structured details: work mode, industry, level, salary range, skills,
--    required documents
--  * application_method 'platform' = applicants apply on this site
--  * job_applications + job_application_files (PDF stored in the database)
-- Both new tables are locked down exactly like the rest (RLS on, no access
-- for anon/authenticated); the server connects as the table owner.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.job_number_seq START 1001;

ALTER TABLE public.manual_jobs ADD COLUMN IF NOT EXISTS job_number BIGINT;
UPDATE public.manual_jobs m
   SET job_number = n.num
  FROM (SELECT id, nextval('public.job_number_seq') AS num
          FROM (SELECT id FROM public.manual_jobs WHERE job_number IS NULL ORDER BY created_at, id) ordered) n
 WHERE m.id = n.id;
ALTER TABLE public.manual_jobs ALTER COLUMN job_number SET DEFAULT nextval('public.job_number_seq');
ALTER TABLE public.manual_jobs ALTER COLUMN job_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS manual_jobs_job_number_key ON public.manual_jobs (job_number);

ALTER TABLE public.manual_jobs
  ADD COLUMN IF NOT EXISTS work_mode TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS salary_min INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max INTEGER,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT NOT NULL DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS salary_period TEXT NOT NULL DEFAULT 'month',
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_documents TEXT[] NOT NULL DEFAULT '{resume}';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manual_jobs_work_mode_check') THEN
    ALTER TABLE public.manual_jobs ADD CONSTRAINT manual_jobs_work_mode_check
      CHECK (work_mode IS NULL OR work_mode IN ('onsite','remote','hybrid'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manual_jobs_salary_check') THEN
    ALTER TABLE public.manual_jobs ADD CONSTRAINT manual_jobs_salary_check
      CHECK ((salary_min IS NULL OR salary_min >= 0) AND (salary_max IS NULL OR salary_max >= 0)
             AND (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
             AND salary_period IN ('hour','day','week','month','year'));
  END IF;
END $$;

-- 'platform' = candidates apply through this site.
ALTER TABLE public.manual_jobs DROP CONSTRAINT IF EXISTS manual_jobs_application_method_check;
ALTER TABLE public.manual_jobs ADD CONSTRAINT manual_jobs_application_method_check
  CHECK (application_method IN ('website','google_form','email','platform'));
ALTER TABLE public.job_submissions DROP CONSTRAINT IF EXISTS job_submissions_application_method_check;
ALTER TABLE public.job_submissions ADD CONSTRAINT job_submissions_application_method_check
  CHECK (application_method IN ('website','google_form','email','platform'));

-- Extra structured fields from the public posting form, copied to the job on approval.
ALTER TABLE public.job_submissions ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.job_applications (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT REFERENCES public.manual_jobs(id) ON DELETE SET NULL,
  job_number BIGINT,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  work_profile_url TEXT,
  work_samples_url TEXT,
  how_heard TEXT,
  whatsapp_updates BOOLEAN NOT NULL DEFAULT false,
  marketing_opt_out BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  resume_filename TEXT NOT NULL,
  resume_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','shortlisted','rejected')),
  admin_notes TEXT,
  ip_hash TEXT,
  submission_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_applications_job_idx ON public.job_applications (job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_created_idx ON public.job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_ip_idx ON public.job_applications (ip_hash, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS job_applications_one_per_job_email
  ON public.job_applications (job_id, lower(email)) WHERE job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.job_application_files (
  application_id BIGINT PRIMARY KEY REFERENCES public.job_applications(id) ON DELETE CASCADE,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  data BYTEA NOT NULL
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_application_files ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r text;
BEGIN
  REVOKE ALL ON public.job_applications, public.job_application_files FROM PUBLIC;
  REVOKE ALL ON SEQUENCE public.job_number_seq, public.job_applications_id_seq FROM PUBLIC;
  FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON public.job_applications, public.job_application_files FROM %I', r);
      EXECUTE format('REVOKE ALL ON SEQUENCE public.job_number_seq, public.job_applications_id_seq FROM %I', r);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL PRIVILEGES ON public.job_applications, public.job_application_files TO service_role;
    GRANT ALL PRIVILEGES ON SEQUENCE public.job_number_seq, public.job_applications_id_seq TO service_role;
  END IF;
END $$;

COMMIT;
