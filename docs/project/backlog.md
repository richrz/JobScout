# JobScout Backlog

**Status:** Active  
**Purpose:** Single plain-language backlog for bugs, UX debt, and next product work

Use this file first when deciding what to build or fix next.

Rules:
- Add new items here first in one plain sentence.
- Move an item into `docs/bugs/` only if it needs a deeper bug report, proof, or root-cause writeup.
- Remove or mark items clearly when shipped so the list stays trustworthy.

## Now

- [ ] Add import review and merge control for Master Data so users can accept or reject imported fields before they become truth.
- [ ] Capture the exact submitted resume artifact for each apply flow so the system knows what was actually sent.
- [ ] Infer the 7-dimension voice profile from uploaded writing samples so Resume Builder stops depending on manual-only slider setup.

## Active Bugs And UX Debt

- [ ] JobSwipe right-swipe needs a clear `Saved` confirmation instead of the card simply disappearing.
- [ ] The bottom dock and desktop sidebar should never appear on screen at the same time.
- [ ] JobSwipe bottom actions should use `Pass` and `Save`, remove the redundant dismiss `X`, and move `Details` off the bottom action row.
- [ ] Passed Bin is too prominent in navigation and should likely be demoted once Inbox filters return.
- [ ] Inbox multi-select still needs layout cleanup and stronger bulk-selection affordances.
- [ ] Inbox wording still needs cleanup around source labels, company actions, and match-score explanation.
- [ ] Jest still reports a lingering open-handle or timer warning in the LLM test area.

## CTS / Discovery

- [ ] Wire CTS semantic search into the cockpit discovery surface so the NEW stage uses ML-powered search instead of basic keyword matching.
- [ ] Add commute search UI — "jobs within 20 min drive from home" using CTS commute filters.
- [ ] Add faceted filter UI — employment type, salary range, company — powered by CTS.

## Later

- [ ] Add an "AI Smell Test" validation indicator into the Cockpit CRAFTING Stage to parse drafts for obvious AI tells (em-dash abuse, banned words like 'delve' or 'tapestry') and warn the user.
- [ ] Build the resume voice profiler so uploads can infer 7 understandable writing sliders with `Resume Writer Zero` as the fallback.
- [ ] Support optional workspace hard-links for imported reference resumes after the global import flow is trustworthy.
- [ ] Add a resume preview -> confirm flow so tailored drafts are explicitly reviewed before they become the accepted version.
- [ ] Show keyword coverage as an inspectable job-term overlay instead of a black-box ATS or match score.
- [ ] Offer optional local/private model support later as a secondary trust feature, not a v1 blocker.

## Pipeline / Data Architecture (National Scale Readiness)

These items emerge from pre-mortem analysis of the KC scraper pipeline against national-scale failure modes.
Priority order reflects value at KC scale → national scale trajectory.
Full context: `docs/research/gemini-Job Board Architecture_ Scalability & Failure Analysis.txt` and `docs/research/gpt-deep-research-report.md`.

### P0 — Correct Now (affect KC data quality today)

- [x] **Split `sourceUrl` into `sourceUrl` + `canonicalUrl` on the `Job` model.** `canonicalUrl` column added (nullable). `fingerprint` (SHA256 of company+title+city) added as the cross-source dedup unique key. The existing `sourceUrl @unique` upsert is preserved as fallback. Normalization now populates both. Migration: `20260321000000_p0_job_pipeline_provenance`.

- [x] **Add timestamp-based stale-overwrite protection to the job upsert.** `lastExtractedAt` field added to `Job`. A Postgres `BEFORE UPDATE` trigger (`job_stale_overwrite_guard`) silently drops any UPDATE where `incoming.lastExtractedAt < stored.lastExtractedAt`. Normalization sets `lastExtractedAt` from `scrapedAt`. Migration: same as above.

- [x] **Add `recordConfidence` and `normalizationVersion` fields to the `Job` model.** Both added as nullable fields. Normalization now stamps every new record with a heuristic confidence score (0–1) and the contract version string `"1.0"`. Migration: same as above.

- [x] **Add structured extraction fields: `salaryMin`/`salaryMax`, `workMode`, `seniority`, `skillsTags`.** All added as nullable (except `skillsTags` which defaults to `[]`). Normalization populates these with regex classifiers. Enables faceted filter queries without touching the opaque `salary` string. Migration: same as above.

- [x] **Add HTML → Markdown pre-processing before every Gemini extraction call.** `src/lib/ingest/html-to-markdown.ts` added — `stripHtmlToMarkdown()` strips scripts, nav, footer, style blocks and converts semantic HTML to markdown. Hooked into `normalization.ts`: clean-JSON ATS sources skip it, all scraped HTML sources run through it. Estimated 95%+ token reduction on career page HTML.

- [x] **Gate LLM extraction by ATS type — skip it when source returns clean JSON.** `src/lib/ingest/ats-classifier.ts` added — `classifyAts(url)` returns `{ system, cleanJson, skipLlm }` for 11 known ATS platforms (Greenhouse, Lever, NeoGov, USAJOBS, SmartRecruiters, iCIMS, Taleo, Workday, SuccessFactors, Jobvite, BambooHR). Hooked into normalization. `detectAtsSystem()` exported for Company entity enrichment.

### P1 — Before Expanding Beyond KC (prerequisite for multi-city)

- [x] **Extract a canonical `Company` table.** `Company` model added with `canonicalName` (unique slug), `displayName`, `domain`, `careerPageUrl`, `atsSystem`, `logoUrl`, `employeeCount`, `industry`. `Job.companyId` added as nullable FK (`onDelete: SetNull`). Old rows keep `NULL`. Ingestion layer will resolve company strings on write. Migration: `20260322000000_p1_company_observed_listing_dedupe`.

- [x] **Formalize `ObservedListing` as a first-class table.** `ObservedListing` added: one row per raw source occurrence, `jobId` nullable FK to canonical `Job` (set after dedup), `rawContent TEXT` for full re-extraction without re-fetching, `extractedAt`, `normalizationVersion`, `normalizationError`. Enables 3-listing → 1-Job dedup architecture. Migration: same.

- [x] **Schema foundation for three-tier dedup pipeline.** `DedupeDecision` audit log table added: records every pair comparison (`listingAId`, `listingBId`, `method`, `outcome`, `similarity`, `mergedIntoJobId`, `llmReasoning`). No FK constraints to `ObservedListing` — loose coupling so the log survives listing churn. The dedup worker implementation is a separate backlog item. Migration: same.

- [ ] **Implement three-tier dedup worker: exact URL → embedding similarity → LLM judge.** Schema is ready (`ObservedListing`, `DedupeDecision`). Now wire the worker: (1) exact `canonicalUrl` match as fast path, (2) cosine similarity on title+description embeddings ≥ 0.90 threshold, (3) LLM call for the gray zone (0.75–0.90). Write decisions to `DedupeDecision`. Merge winning pair by pointing both `ObservedListing.jobId` to the surviving canonical `Job`.

### P2 — National Scale (10+ cities, 100+ sources)

- [ ] **Add `JobFamily` tracking to recognize reposted roles.** The same "Backend Engineer II" role at Garmin gets reposted monthly after closing. Without job family tracking, each repost creates a new unrelated canonical job. A `JobFamily` model (company + title_bucket + department) links versions of the same recurring role across time, enabling "this role was open 3 times in the past year" signals and preventing over-merging of distinct current roles with closed historical ones.

- [ ] **Implement hybrid search: BM25 + dense vector + Reciprocal Rank Fusion.** Current search is keyword-only. Hybrid search allows "React Developer" to surface "Frontend Engineer" roles (semantic) alongside exact-match jobs (lexical), merged and ranked via RRF. Requires: embedding generation per job at ingestion time (text-embedding-3-small or equivalent), vector storage (pgvector extension on existing Postgres), and an RRF merge layer in the search API. CTS covers this in the short term — own the stack when CTS costs become significant at 10+ cities.

- [ ] **Build a scraper health + operational telemetry dashboard.** At 100+ sources, blind scraping is operationally unmanageable. Need per-source metrics: jobs_found, jobs_new, jobs_deduped, jobs_quarantined, llm_tokens_used, llm_cost, error_rate, last_successful_run. The `ScraperRun` model exists but isn't surfaced anywhere. Build an internal ops view (admin-only route) that shows pipeline health per source and surfaces broken scrapers before they silently poison the feed.

- [ ] **Implement MSA/metro bounding box discovery instead of city-level queries.** At KC scale, a city-level JSearch query works fine. At 10+ metro areas, query volume explodes if each city generates independent queries across multiple job categories. Switch discovery to Metropolitan Statistical Area (MSA) bounding boxes — one geo unit covers the full metro commute zone. This reduces query volume linearly and prevents overlapping radius coverage between adjacent cities generating duplicate records.

## Detailed Bug Reports

- [Bug 001: Rate Limiting Blocking Auto-Save](/home/richard/code/jobs/docs/bugs/bug-001-rate-limiting.md)
