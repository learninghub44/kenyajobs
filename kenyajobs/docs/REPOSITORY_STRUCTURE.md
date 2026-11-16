# Repository and application structure

## Two levels, two purposes

The GitHub repository has a root folder and a deployable application folder:

- **Repository root** — project-level README and GitHub collaboration information.
- **`kenyajobs/`** — the actual Next.js application. Its `package.json`, Next.js config and Vercel config are here.

For the current Vercel project, the Root Directory should remain `kenyajobs`. Running npm commands from the repository root will not find the application package manifest.

## Application folders

| Folder | Put these files here | Important rule |
|---|---|---|
| `pages/` | Public pages and file-based routes | File and folder names define URL paths. |
| `pages/api/` | API route handlers | Keep server endpoints here while using the Pages Router. |
| `lib/` | Shared server logic, database helpers and reusable utilities | Keep secrets and privileged database operations server-side. |
| `styles/` | Global CSS and shared style files | Avoid duplicating global overrides across page files. |
| `public/` | Static images, icons and other public assets | Files are served directly; never place secrets here. |
| `docs/` | Setup, architecture and operational documentation | Keep the docs index updated when adding a guide. |
| `supabase/migrations/` | Ordered SQL schema changes | Add a new migration for each future schema change; do not overwrite an already-applied migration. |

## Naming and placement conventions

- Use descriptive, lowercase, kebab-case names for new documentation and migration files.
- Keep page-specific components near their owning page where that is already the convention; move shared components only when multiple routes genuinely reuse them.
- Keep API handlers in `pages/api/`; do not move them into `lib/`. Put reusable business logic in `lib/` and import it from the handler.
- Keep SQL migrations separate from application JavaScript.
- Store environment-variable names and setup instructions in documentation, but never store actual secret values.
- Avoid creating duplicate copies of configuration files, database schemas, stylesheets or helper modules.

## Safe cleanup policy

Do not mass-move Next.js routes, API handlers, stylesheets or imported modules just to make the tree look different. A move can silently change URLs, imports, route matching or the deployment build. First update imports and references, run lint and a production build, then merge the move through a reviewed pull request.

Historical feature branches are not part of the deployed source tree. The default branch is `main`; merged changes should be made from fresh branches based on `main`.
