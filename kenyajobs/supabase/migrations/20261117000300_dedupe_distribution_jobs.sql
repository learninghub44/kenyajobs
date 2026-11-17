-- Prevent the same vacancy being queued repeatedly when it arrives from
-- multiple aggregators with different upstream IDs.
BEGIN;
ALTER TABLE public.job_distribution_queue
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

UPDATE public.job_distribution_queue
SET dedupe_key = md5(
  CASE
    WHEN COALESCE(NULLIF(BTRIM(payload->>'url'),''), NULLIF(BTRIM(payload->>'job_url'),''), NULLIF(BTRIM(payload->>'apply_url'),''), NULLIF(BTRIM(payload->>'application_url'),''), NULLIF(BTRIM(payload->>'redirect_url'),'')) IS NOT NULL
    THEN 'url:' || LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(NULLIF(BTRIM(payload->>'url'),''), NULLIF(BTRIM(payload->>'job_url'),''), NULLIF(BTRIM(payload->>'apply_url'),''), NULLIF(BTRIM(payload->>'application_url'),''), NULLIF(BTRIM(payload->>'redirect_url'),'')), '/+$', ''), '[?#].*$', ''))
    ELSE LOWER(REGEXP_REPLACE(CONCAT_WS('|',
      BTRIM(REGEXP_REPLACE(COALESCE(payload->>'title',payload->>'job_title',''),'[^[:alnum:]]+',' ','g')),
      BTRIM(REGEXP_REPLACE(COALESCE(payload->>'company',payload->>'company_name',payload->>'employer_name',''),'[^[:alnum:]]+',' ','g')),
      BTRIM(REGEXP_REPLACE(COALESCE(payload->>'location',payload->>'candidate_required_location',payload->>'job_city',''),'[^[:alnum:]]+',' ','g'))
    ), '[[:space:]]+', ' ', 'g'))
  END
)
WHERE dedupe_key IS NULL OR dedupe_key = '';

-- Preserve queue history. Keep one canonical record per vacancy/channel;
-- mark extra unposted rows failed and give all extras unique audit fingerprints.
WITH ranked AS (
  SELECT id, status, ROW_NUMBER() OVER (
    PARTITION BY channel, dedupe_key
    ORDER BY CASE status WHEN 'posted' THEN 0 WHEN 'ready' THEN 1 WHEN 'pending_approval' THEN 2 ELSE 3 END,
             COALESCE(posted_at, updated_at, created_at) DESC, id DESC
  ) AS rn
  FROM public.job_distribution_queue
  WHERE dedupe_key IS NOT NULL
)
UPDATE public.job_distribution_queue q
SET dedupe_key = md5('legacy-duplicate:' || q.id::text),
    status = CASE WHEN r.status = 'posted' THEN 'posted' ELSE 'failed' END,
    error = CASE WHEN r.status = 'posted' THEN q.error ELSE 'Duplicate vacancy detected during deduplication; retained for audit and blocked from publication.' END,
    updated_at = now()
FROM ranked r
WHERE q.id = r.id AND r.rn > 1;

ALTER TABLE public.job_distribution_queue
  ALTER COLUMN dedupe_key SET NOT NULL;
ALTER TABLE public.job_distribution_queue
  DROP CONSTRAINT IF EXISTS job_distribution_queue_job_id_channel_key;
CREATE UNIQUE INDEX IF NOT EXISTS job_distribution_queue_channel_dedupe_key
  ON public.job_distribution_queue(channel, dedupe_key);
COMMIT;
