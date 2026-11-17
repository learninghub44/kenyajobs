-- Persist the employer's selected application destination explicitly.
BEGIN;
ALTER TABLE public.job_submissions
  ADD COLUMN IF NOT EXISTS application_method TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS application_email TEXT;
ALTER TABLE public.manual_jobs
  ADD COLUMN IF NOT EXISTS application_method TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS application_email TEXT;

UPDATE public.job_submissions
SET application_method='email',
    application_email=lower(split_part(regexp_replace(application_url, '^mailto:', '', 'i'), '?', 1))
WHERE application_url ILIKE 'mailto:%'
  AND (application_email IS NULL OR application_email='');
UPDATE public.job_submissions
SET application_method='google_form'
WHERE application_url ~* '^https://(forms\.gle/|docs\.google\.com/forms/)';

UPDATE public.manual_jobs
SET application_method='email',
    application_email=lower(split_part(regexp_replace(url, '^mailto:', '', 'i'), '?', 1))
WHERE url ILIKE 'mailto:%'
  AND (application_email IS NULL OR application_email='');
UPDATE public.manual_jobs
SET application_method='google_form'
WHERE url ~* '^https://(forms\.gle/|docs\.google\.com/forms/)';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='job_submissions_application_method_check') THEN
    ALTER TABLE public.job_submissions ADD CONSTRAINT job_submissions_application_method_check
      CHECK (application_method IN ('website','google_form','email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='manual_jobs_application_method_check') THEN
    ALTER TABLE public.manual_jobs ADD CONSTRAINT manual_jobs_application_method_check
      CHECK (application_method IN ('website','google_form','email'));
  END IF;
END $$;
COMMIT;
