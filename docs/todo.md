# Cloud Talent Solution Integration — Activation Guide

**Status:** Code shipped, awaiting GCP setup
**Date:** 2026-03-15

## What Was Built

### New files
- `job-search-platform/src/lib/cts/talent-service.ts` — Full CTS service: company management, job upsert/delete/batch, semantic search with commute filters, salary parsing, health check
- `job-search-platform/scripts/sync-jobs-to-cts.ts` — One-time script to push existing Postgres jobs to CTS
- `job-search-platform/src/app/api/admin/cts-status/route.ts` — Health check + sync status endpoint

### Modified files
- `job-search-platform/prisma/schema.prisma` — Added `ctsJobName` field to Job model
- `job-search-platform/src/lib/job-service.ts` — Dual-write: Postgres + CTS (best-effort, non-blocking)
- `job-search-platform/src/app/api/jobs/route.ts` — Uses CTS semantic search when configured + query/location present, Postgres fallback otherwise
- `job-search-platform/.env.example` — CTS env vars documented

### Architecture

```
JSearch API → Postgres (source of truth) → CTS (search layer, best-effort)
                                         ↓
Search query → CTS semantic search → map results back to Postgres IDs
                                   → return merged data to frontend
No CTS? → Falls back to existing Postgres ILIKE search (zero breakage)
```

### New search API params
- `?q=` — Semantic search (CTS understands synonyms, seniority, industry)
- `?location=Kansas City, MO` — Location filter
- `?distance=20` — Miles radius
- `?commuteMethod=DRIVING&commuteTime=20&lat=39.0997&lng=-94.5786` — "Jobs within 20 min drive"
- `?employmentTypes=FULL_TIME,CONTRACT` — Employment type filter

## To Activate

You need three things from GCP:

1. **Create a GCP project** and enable the "Cloud Talent Solution" API
2. **Create a service account** with "Cloud Talent Editor" role, download the JSON key
3. **Create a tenant** (or use default)

Then add to your `.env`:
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
CTS_TENANT_ID=default
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

Then run: `npx tsx scripts/sync-jobs-to-cts.ts` to push existing jobs.

After that, every new job ingestion auto-syncs to CTS, and searches use semantic matching. Without these env vars, everything falls back to the existing Postgres search — zero breakage.

## CTS Pricing (for reference)

| Operation | Free tier | After free tier |
|---|---|---|
| Search calls/month | 10,000 | $0.0015/call |
| Jobs+Companies stored/month | 10,000 | $0.00025/item |

At current scale (~100 jobs, ~100 searches/month): **$0/month**.

## What CTS Gives Us

- **Semantic search** — "software engineer" matches "backend developer", "senior programmer"
- **Commute search** — "jobs within 20 min drive from my house"
- **Auto-enrichment** — derives job categories, resolves addresses, infers seniority
- **Spell correction** — built-in
- **Faceted filtering** — employment type, compensation, location, company, job category
- **Result diversification** — clusters similar jobs to reduce monotony

## Next Steps

- [ ] Set up GCP project and enable Cloud Talent Solution API
- [ ] Create service account, download JSON key
- [ ] Add env vars to `.env`
- [ ] Run `npx tsx scripts/sync-jobs-to-cts.ts` to push existing jobs
- [ ] Verify search works: `GET /api/jobs?q=software+engineer`
- [ ] Verify commute search: `GET /api/jobs?commuteMethod=DRIVING&commuteTime=20&lat=39.0997&lng=-94.5786`
- [ ] Verify health endpoint: `GET /api/admin/cts-status`
- [ ] Wire commute search UI into cockpit (future)
- [ ] Add faceted filter UI (future)
- [ ] Feed client events (clicks, saves, applies) back to CTS for relevance tuning (future)
