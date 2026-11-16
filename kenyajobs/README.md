# JOBS HUB KENYA — Application

This directory contains the deployable Next.js application for **JOBS HUB KENYA**.

- **Production site:** https://onlinejobs.christech.co.ke
- **Framework:** Next.js Pages Router
- **Runtime:** Node.js
- **Database:** PostgreSQL
- **Deployment root:** this directory (`kenyajobs/`)

## Start here

From this directory:

```bash
npm install
npm run dev
```

Open http://localhost:3000./online jobs.christech.co.ke

| Command | Purpose |
|---|---|
| `npm run dev` | Start local development |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## Main application areas

| Path | Responsibility |
|---|---|
| `pages/` | Public pages and Next.js file-based routes |
| `pages/api/` | Server-side API endpoints |
| `lib/` | Shared application logic, database access and helpers |
| `styles/` | Global and shared styling |
| `docs/` | Setup and maintenance guides |
| `supabase/migrations/` | Versioned PostgreSQL migrations |
| `public/` | Static assets served directly by Next.js |

Do not move files out of `pages/` or rename route files without checking their URL and API dependencies. Keep server-only secrets in server-side environment variables.

## Current platform capabilities

The application includes:

- Public job discovery and job detail pages.
- Employer job submission with admin review before publication.
- Paid job promotion packages and listing expiry/renewal management.
- Event submissions, multi-event bundles, event pages and poster uploads.
- Admin-managed career articles and blog publishing.
- Admin controls for job distribution channels (WhatsApp and Telegram), where real channel destinations are configured.
- Sponsored placements and site content management.
- Search-engine metadata, sitemap and robots handling.

The admin area is protected by the application's password/session flow. This application does not currently use Supabase Auth for administrator sign-in.

## Environment variables

Set these in `.env.local` for local development and in the hosting provider for production. Do not commit `.env.local` or real secret values.

| Variable | Required when | Notes |
|---|---|---|
| `DATABASE_URL` | Database-backed features | PostgreSQL connection string. The database helper also accepts `POSTGRES_URL` or `POSTGRES_URL_NON_POOLING`. |
| `ADMIN_PASSWORD` | Admin access | Use a strong, unique password. |
| `ADMIN_SESSION_SECRET` | Recommended for admin sessions | Use a separate random secret; do not reuse a public value. |
| `SUPABASE_URL` | Event poster uploads | Supabase project URL. The upload handler also accepts `NEXT_PUBLIC_SUPABASE_URL`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Event poster uploads | Server-only secret. Never use a `NEXT_PUBLIC_` prefix. |
| `SUPABASE_EVENT_BUCKET` | Optional | Storage bucket name; defaults to `event-posters`. |
| `CRON_SECRET` | Scheduled endpoints | Configure the same secret for the hosting cron and any external scheduled caller. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional advertising | AdSense publisher/client identifier. |
| `RAPIDAPI_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | Optional job-source integrations | Only needed when enabling the corresponding providers. |

The exact behavior of optional integrations depends on their configuration. Do not add placeholder secrets to production.

## Database setup

The explicit baseline migration is:

`supabase/migrations/20261116000100_initial_schema.sql`

Follow [the Supabase setup guide](./docs/SUPABASE_DATABASE_SETUP.md). The migration is a repository file; it is **not** applied to a Supabase project just because it has been merged. Run it manually in the intended project's SQL Editor and verify the tables.

The application also retains an idempotent runtime schema bootstrap in `lib/db.js`. Keep the migration and runtime schema aligned when database structures change.

## Scheduled tasks

The Vercel configuration in `vercel.json` defines the listing-expiry cron schedule. Review the endpoint and secret requirements before changing it. The job-feed refresh workflow, if enabled in GitHub Actions, is configured separately from the Vercel cron.

## Documentation

See [`docs/README.md`](./docs/README.md) for the documentation index, including database setup and repository structure.

## Safety and maintenance rules

- Keep credentials and service-role keys out of source control and client bundles.
- Validate and authorize every admin/API action on the server.
- Do not trust tenant, role, price or status values supplied by the browser.
- Preserve existing database records when applying schema changes.
- Add schema changes as versioned SQL migrations and keep `lib/db.js` compatible until the runtime bootstrap is intentionally retired.
- Do not move route files or change deployment settings without checking build and URL behavior.
