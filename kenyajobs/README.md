This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## JobsWorldwide

A job board that aggregates listings live from ~15 free job APIs/RSS feeds (Remotive, Jobicy, Arbeitnow, ReliefWeb, BrighterMonday, MyJobMag, JSearch, Adzuna, and more) and merges them with manually-posted jobs and sponsored listings managed through `/admin`.

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes, for admin/manual jobs/ads | Standard Postgres connection string. Works with [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Neon](https://neon.tech), [Supabase](https://supabase.com), or self-hosted. Tables are created automatically on first request — no separate migration step. |
| `ADMIN_PASSWORD` | Yes, for `/admin` | Single shared password that gates the admin area. |
| `ADMIN_SESSION_SECRET` | No | Used to sign the admin session cookie. Falls back to `ADMIN_PASSWORD` if unset. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | No | Your AdSense publisher ID (`ca-pub-...`). When set, AdSense fills any ad slot that has no admin-managed sponsored listing. |
| `RAPIDAPI_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | No | Optional keys for the JSearch and Adzuna job sources — the site works without them, just with fewer sources. |

Without `DATABASE_URL` set, the site still works exactly as before (live-pulled jobs only) — manual jobs and ads APIs fail soft and return empty results.

### Admin area

Visit `/admin`, sign in with `ADMIN_PASSWORD`, and you can:
- Post, edit, publish/unpublish, and delete manually-posted jobs, including salary, company logo/website, and which listing pages they appear on (homepage always; remote/entry-level/graduate/work-from-home optionally).
- Create, edit, pause, and delete sponsored ads with a destination URL, optional image, placement, and priority.

Manually-posted jobs are merged into the homepage, the four category pages, and search — sorted with featured jobs first. Sponsored ads render via the `AdSlot` component wherever it's placed, falling back to a Google AdSense unit (if `NEXT_PUBLIC_ADSENSE_CLIENT` is set) or a quiet placeholder.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
