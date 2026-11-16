# JOBS HUB KENYA — Supabase database setup

This project uses **PostgreSQL** through the `pg` package. It does not use Supabase Auth or Supabase's client SDK for its application database. The admin area currently uses the site's `ADMIN_PASSWORD` and signed session cookie.

## Migration inventory

The baseline migration at `supabase/migrations/20261116000100_initial_schema.sql` is transcribed from the schema bootstrap in `lib/db.js`. It creates or upgrades every application table currently declared there:

| Table | Purpose |
|---|---|
| `manual_jobs` | Admin-created jobs, publishing, featured placement and paid listing lifecycle |
| `job_submissions` | Employer job submissions, package/payment review, idempotency and abuse controls |
| `event_submissions` | Event submissions, bundle grouping, package/payment review and idempotency |
| `events` | Approved public events, event URLs, poster URLs and expiry/renewal |
| `blog_posts` | Admin-managed career articles |
| `ads` | Sponsored placements |
| `job_posting_links` | Hashed, expiring, revocable employer invitation links |
| `admin_login_attempts` | Admin login lockout counters |
| `social_channel_settings` | WhatsApp/Telegram distribution settings |
| `job_distribution_queue` | Moderated WhatsApp/Telegram job distribution queue |
| `job_distribution_logs` | Distribution action history |
| `live_job_cache` | Cached job-source payloads |

The migration also creates the indexes declared by the application and inserts the singleton social-channel settings row. It is safe to run again: table, column and index creation is guarded with `IF NOT EXISTS`, and the settings insert uses `ON CONFLICT DO NOTHING`.

## Apply it in Supabase

1. Open the Supabase project used by JOBS HUB KENYA.
2. Open **SQL Editor → New query**.
3. Open and copy the complete contents of `supabase/migrations/20261116000100_initial_schema.sql` from this repository.
4. Paste it into SQL Editor and click **Run**.
5. Confirm the 12 tables above appear under **Table Editor**. Do not delete existing tables or rows.

The migration is PostgreSQL SQL and includes the Supabase Storage bucket setup for `event-posters`. It sets the bucket to public-read for poster URLs and restricts file types to JPG, PNG and WebP with a 5 MB limit. Uploads are made by the server using the service-role key; do not add an anonymous upload policy.

## Hosting environment variables

Set these in the hosting provider for the production deployment:

- `DATABASE_URL` — Supabase Postgres connection string (preferred), or `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING`. Use the connection string format shown in Supabase **Connect**; choose the connection mode compatible with your host.
- `ADMIN_PASSWORD` — strong, unique admin password.
- `ADMIN_SESSION_SECRET` — separate random secret of at least 32 random bytes.
- `SUPABASE_URL` — Supabase project URL, e.g. `https://PROJECT_REF.supabase.co`.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only service-role secret. Never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_EVENT_BUCKET` — optional; defaults to `event-posters`.
- `CRON_SECRET` — recommended secret for scheduled refresh and expiry jobs.

After changing environment variables, redeploy the application.

## Important boundaries

- This migration covers the **database schema declared by the current application code**. Live job listings from external job feeds are fetched from those providers; they are not stored as permanent rows in this database.
- Event poster files live in Supabase Storage; only their public URLs are stored in `event_submissions` and `events`.
- Do not run this SQL in a different Supabase project from the one configured in production.
- The migration does not create admin users in Supabase Auth because this application does not currently use Supabase Auth.
- The app still has an idempotent runtime schema bootstrap in `lib/db.js` for compatibility. This migration gives you an explicit, reviewable database setup; it does not remove that existing fallback.
- This is a baseline snapshot, not a claim that the production database has already been migrated. Run it in the intended Supabase project and verify the tables before considering setup complete.
