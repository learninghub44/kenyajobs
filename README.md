# JOBS HUB KENYA

The source repository for **JOBS HUB KENYA**, the Kenyan and international job-discovery and career platform maintained by Learninghub44.

- **Production site:** https://onlinejobs.christech.co.ke
- **GitHub:** https://github.com/learninghub44/kenyajobs
- **Application directory:** [`kenyajobs/`](./kenyajobs)
- **Application and deployment guide:** [`kenyajobs/README.md`](./kenyajobs/README.md)
- **Technical documentation index:** [`kenyajobs/docs/README.md`](./kenyajobs/docs/README.md)

## Repository layout

This repository keeps the deployable Next.js application inside the `kenyajobs/` directory. The repository root is for repository-level information; application code and its package manifest live inside that directory.

```text
kenyajobs/
├── docs/                 # Setup, architecture and operational documentation
├── lib/                  # Shared server-side logic and data access
├── pages/                # Next.js Pages Router screens and API routes
├── styles/               # Global and page-level styles
├── supabase/
│   └── migrations/       # Versioned PostgreSQL schema migrations
├── package.json          # Application dependencies and scripts
├── next.config.mjs       # Next.js configuration
└── vercel.json           # Hosting headers and scheduled jobs
```

Keep Next.js route files under `pages/` and API handlers under `pages/api/`. Their file paths define public URLs, so do not move them casually.

## Local development

Run commands from the application directory:

```bash
cd kenyajobs
npm install
npm run dev
```

Open http://localhost:3000.

Useful scripts:

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run start` — serve a production build
- `npm run lint` — ESLint

## Deployment

For the existing Vercel project, set the **Root Directory** to `kenyajobs`, use the `main` branch, and use the package scripts above. Do not point Vercel at the repository root because the Next.js package manifest is inside `kenyajobs/`.

Configure production secrets in Vercel Project Settings → Environment Variables. Never commit real credentials, database URLs, admin passwords, or service-role keys.

Read [the deployment and environment guide](./kenyajobs/README.md) before changing hosting settings.

## Database

The PostgreSQL baseline migration is:

`kenyajobs/supabase/migrations/20261116000100_initial_schema.sql`

Instructions: [Supabase database setup](./kenyajobs/docs/SUPABASE_DATABASE_SETUP.md).

The migration must be run manually in the correct Supabase project's SQL Editor. Merging it into GitHub does **not** apply it to the live database.

## Documentation

Start at [`kenyajobs/docs/README.md`](./kenyajobs/docs/README.md) for the documentation index and operational guides.

## Contribution workflow

- Make changes on a feature or maintenance branch.
- Open a pull request into `main`.
- Review the changed files and checks before merging.
- Keep commits under the repository owner's GitHub identity.
- Do not commit build output, dependency folders, local environment files, or secrets.

## License

Proprietary software. All rights reserved. See [LICENSE](./LICENSE) if present in this repository.
