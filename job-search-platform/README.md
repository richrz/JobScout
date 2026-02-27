# Job Search Platform

Production-style job search app built with Next.js + Prisma + PostgreSQL.

## What You Need

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (local service or managed DB)
- A port other than `3000` (we use `3101` or `3173`)

## Repository Layout

This folder is the runnable app.

## Quick Start (Local)

1. Install dependencies.

```bash
npm ci
```

2. Create your env file.

```bash
cp .env.example .env.local
```

3. Set `DATABASE_URL` in `.env.local`.

4. Sync schema to your database.

```bash
npx prisma db push
```

5. Start the app.

```bash
PORT=3173 npm run dev
```

## Minimum Env For A Live App

Required:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`

Recommended:

- `NEXTAUTH_URL`
- `NODE_ENV=development` (local) or `production` (server)

Needed for live scraping:

- `JSEARCH_API_KEY`

Optional:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (map UI)
- `GOOGLE_MAPS_API_KEY` (server-side geocoding)
- `REDIS_URL` (cache)
- LLM keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.)

## VPS Install (From GitHub)

1. Clone the repo.
2. Enter this app folder (`job-search-platform/` inside the repo root).
3. Install deps and set env.
4. Prepare DB schema.
5. Start app on `3101`.
6. Put Nginx in front and add TLS cert.

Detailed runbook: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Common Failures

- `Environment variable not found: DATABASE_URL`
  - `.env`/`.env.local` missing in the running app folder.
- `PrismaClientInitializationError`
  - DB is down, URL is wrong, or schema not pushed.
- `/jobs` `500` with `searchParams ... must be unwrapped`
  - Next.js 16 requires async `searchParams` handling in server pages.
