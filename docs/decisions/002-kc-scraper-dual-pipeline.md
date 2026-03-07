# ADR 002: KC Scraper Dual-Pipeline Architecture

**Status**: Accepted  
**Date**: 2026-03-04  
**Author**: Richard + AI Planning Session

## Context

The platform currently ingests job data from a single source: the JSearch API (RapidAPI). This is a "bought data" pipeline — we pay per API call and receive pre-aggregated results from Google for Jobs.

We want to add a second pipeline that scrapes job listings directly from Kansas City company career pages. This is inspired by [itcompaniesnepal.com](https://itcompaniesnepal.com/jobs), which scrapes 926 companies in Nepal.

### Requirements
- Track which jobs came from API vs scraping (for cost analysis and debugging)
- Deduplicate jobs that appear in both pipelines
- Use LLM (Gemini 3.1 Flash-Lite) to extract structured data from raw HTML
- Keep schema changes additive and non-breaking
- Support "polite" scraping with rate limiting and content change detection

## Decision

Implement a dual-pipeline architecture where both API and scraped data flow through a shared Normalizer into the same `Job` table.

### Key Design Choices

1. **Single `Job` table** — not separate tables for API vs scraped jobs. Differentiated by `sourceType` enum (`api` | `scraped`) and `source` string (e.g., `jsearch`, `scraped_garmin_careers`).

2. **SHA256 fingerprint deduplication** — `fingerprint` column with unique constraint. Generated from `normalize(company + title + city)`. On collision, update instead of insert.

3. **Raw HTML separation** — stored in `RawJobContent` table, not in the main `Job` table. Keeps the primary table clean and fast.

4. **Gemini 3.1 Flash-Lite for extraction** — cost-effective, fast, reliable JSON output. Used to parse `skills`, `benefits`, `department`, etc. from raw job description HTML.

5. **Scraper health tracking** — `ScraperRun` model logs each scrape attempt. `ScrapedCompany` model tracks company career page URLs and scraper status.

## Consequences

### Positive
- Cost visibility: can compare API spend vs scraper compute cost
- Richer data for scraped jobs (raw HTML, extracted skills, benefits)
- KC-specific data not available from JSearch
- Foundation for expanding to other cities later

### Negative
- Schema grows (4 new columns on Job, 3 new models)
- Scraper maintenance burden (career pages change without notice)
- LLM extraction costs (small but nonzero)
- Must handle scraper failures gracefully

## Related Files
- `docs/kc-scraper-plan.md` — Full implementation plan
- `JOURNAL.md` — Strategic context for this decision
