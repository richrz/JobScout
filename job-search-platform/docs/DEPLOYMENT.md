# Deployment Runbook

This runbook documents the exact requirements and steps to run this app in a live VPS environment.

## 1) Requirements

- Ubuntu/Debian server
- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Nginx
- Certbot (`python3-certbot-nginx`)
- DNS A record for your domain pointing to the VPS IP

## 2) Clone And Enter The App Folder

If you clone the full repository, the runnable app is in `job-search-platform/`.

```bash
git clone <your-repo-url>
cd <repo-root>/job-search-platform
```

## 3) Install Dependencies

```bash
npm ci
```

## 4) Configure Environment

Copy and edit:

```bash
cp .env.example .env
```

Minimum required values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NODE_ENV=production` (or `development` for non-production)

Needed for real scraping:

- `JSEARCH_API_KEY`

## 5) Prepare Database

If PostgreSQL is local, create DB/user and grant access first, then run:

```bash
npx prisma db push
```

## 6) Start The App

Run on a non-3000 port:

```bash
PORT=3101 npm run dev
```

For background process (example):

```bash
nohup bash -lc 'PORT=3101 npm run dev' > dev-3101.log 2>&1 &
```

## 7) Reverse Proxy With Nginx

Example server block:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name scout.deskwise.io;

    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Validate and reload:

```bash
nginx -t && systemctl reload nginx
```

## 8) TLS Certificate

```bash
certbot --nginx -d scout.deskwise.io --non-interactive --agree-tos --email admin@deskwise.io --redirect
```

## 9) Verify Live

```bash
curl -I http://scout.deskwise.io
curl -I https://scout.deskwise.io
curl -I https://scout.deskwise.io/jobs
```

Expected:

- HTTP returns `301` to HTTPS
- HTTPS `/` returns `200`
- HTTPS `/jobs` returns `200` (once DB/env/code are healthy)

## 10) Known Failure Modes

- `Environment variable not found: DATABASE_URL`
  - `.env` missing in the app folder being executed.
- Prisma initialization errors
  - DB not running, wrong credentials, or schema not synced.
- DNS propagation mismatch
  - Some networks still resolve an old IP until TTL expires.
- Next.js 16 async `searchParams` errors
  - Server page must await `searchParams` before property access.
