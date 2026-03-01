# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThoughtFoundry is a knowledge operating system for non-technical teams. It uses a three-layer Knowledge Stack model (Data → Agent → Output) where governed, versioned knowledge is defined first, then agents reason and act on that knowledge.

Built on the "iterationzero" template: Next.js (frontend) + FastAPI (backend) + Supabase (auth/database).

## Commands

```bash
# Install dependencies
pnpm install                        # Node
pnpm run fastapi-install             # Python (pip install -r requirements.txt)

# Development (run both simultaneously)
pnpm run next-dev                    # Next.js on port 3000 (with --inspect)
pnpm run fastapi-dev                 # FastAPI on port 8000 (with --reload)

# Build & production
pnpm run build                       # Next.js production build
pnpm run start                       # Start production server

# Code quality
pnpm run lint                        # ESLint
pnpm run prettier                    # Prettier (writes changes)
```

## Architecture

### Frontend (Next.js 16 App Router)

- **Path alias:** `@/*` maps to `./src/*`
- **Route groups** separate concerns:
  - `(auth)/` — login, sign-up, password flows
  - `(public)/` — unauthenticated pages (home)
  - `(private)/` — protected routes requiring auth (e.g., `[username]`)
- **UI:** shadcn/ui components (new-york style) in `src/components/ui/`, styled with Tailwind CSS v4
- **Fonts:** JetBrains Mono as the primary typeface
- **Utility:** `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)

### Backend (FastAPI)

- Single entry point: `api/index.py`
- Next.js proxies `/api/*` to FastAPI via rewrites in `next.config.ts`
  - Dev: proxied to `http://127.0.0.1:8000/api/py/*`
  - Prod: proxied to `/api/`
- FastAPI docs available at `/docs` (Swagger UI)

### Auth & Database (Supabase)

- Supabase clients: `src/lib/supabase/server.ts` (server-side, cookie-based) and `src/lib/supabase/client.ts` (browser)
- Auth middleware: `src/lib/supabase/middleware.ts`
- Database: PostgreSQL with pgvector extension
- SQL migration scripts in `supabase/sql_utilities/`
- Custom `user_profile` table linked to `auth.users` via FK with CASCADE delete

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Conventions

- **Package manager:** pnpm (>=9.12.3)
- **Commit messages:** Conventional commits enforced by commitlint (via Husky pre-commit hooks). Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`, `translation`, `security`, `changeset`. Header max 100 chars. Subject must be lowercase, no period.
- **Formatting:** Prettier with single quotes, trailing commas (es5), 2-space tabs, semicolons
- **shadcn/ui:** Add components via `npx shadcn@latest add <component>` — they land in `src/components/ui/`
