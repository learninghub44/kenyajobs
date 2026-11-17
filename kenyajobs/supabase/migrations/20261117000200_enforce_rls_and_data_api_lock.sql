-- JOBS HUB KENYA - enforce RLS and (re)assert the Data API lock, idempotently.
--
-- Why this exists
--   20261117000100_lock_public_data_api.sql states that RLS stays enabled on
--   every application table, but nothing in the repository enabled it, and that
--   migration aborts (rolling back all of its REVOKEs) when the Supabase helper
--   public.rls_auto_enable() does not exist in the project. This migration:
--     1. explicitly enables RLS on every application table (no policies are
--        created, so anon/authenticated are denied by default), and
--     2. re-applies the same REVOKE/GRANT lock, guarded so that a missing
--        helper function or role cannot make it fail.
--
-- The application connects server-side as the table owner (the `postgres`
-- role via the Supabase pooler), and owners bypass RLS, so the app is
-- unaffected. This only ever narrows access; it is safe to re-run.

BEGIN;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'manual_jobs','blog_posts','job_submissions','event_submissions','events',
    'admin_login_attempts','job_posting_links','ads','live_job_cache',
    'social_channel_settings','job_distribution_queue','job_distribution_logs'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon','authenticated']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', r);
      IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        EXECUTE format('REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM %I', r);
      END IF;
    END IF;
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
  END IF;

  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
  END IF;
END $$;

COMMIT;
