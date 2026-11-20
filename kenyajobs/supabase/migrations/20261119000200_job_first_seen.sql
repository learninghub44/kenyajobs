-- Remember the day each imported job was first seen, so jobs whose source gives
-- no (or a fake "now") posted date can still expire. Idempotent.
BEGIN;
ALTER TABLE public.live_job_cache ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE public.live_job_cache SET first_seen_at = LEAST(first_seen_at, updated_at);
CREATE INDEX IF NOT EXISTS live_job_cache_first_seen_idx ON public.live_job_cache (first_seen_at);
COMMIT;
