# KC Scraper Engine — Implementation Plan

**Date:** 2026-03-04  
**Status:** Active Workstream Reference  
**Depends on:** Existing `job-search-platform` (Next.js + Prisma + PostgreSQL)

> This is a supporting workstream plan for KC scraping. It does not outrank the current implementation roadmap for the broader product overhaul.

> **Strategic Note:** Volume is intentional. The more jobs we scrape, the more overwhelming the raw feed becomes — which makes our filtering, triage, and workspace tools indispensable and justifies a subscription price. We scrape IT jobs from ALL major KC employers (healthcare, government, education, finance, etc.), not just tech companies. IT relevance is determined at the LLM extraction layer.

---

## 1. Overview

Add a custom web scraper pipeline to the existing platform that scrapes IT job listings from Kansas City area company career pages. This runs alongside the existing JSearch API pipeline — two independent data sources, one shared database.

```
Pipeline A (API/Bought)              Pipeline B (Scraped/KC)
┌──────────────────┐                 ┌──────────────────┐
│  JSearch API     │                 │  KC Career Page  │
│  (existing)      │                 │  Scrapers (new)  │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
         │  sourceType: 'api'                 │  sourceType: 'scraped'
         │                                    │
         └──────────┬─────────────────────────┘
                    │
            ┌───────▼────────┐
            │  Normalizer    │  ← dedup, LLM extract, location normalize
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │  Job table     │  ← single source of truth
            │  (Prisma)      │
            └────────────────┘
```

---

## 2. Schema Changes (Additive Only)

All changes are **nullable/optional additions** to the existing `Job` model. No existing columns are modified or removed.

### New columns on `Job` model:
```prisma
// Source tracking
source         String    // e.g., "jsearch", "scraped_garmin_careers"
sourceType     String    // "api" | "scraped"
sourceUrl      String?   // original URL where we found it

// Deduplication
fingerprint    String?   @unique  // SHA256(normalize(company + title + city))
rawContentHash String?   // SHA256 of raw HTML, detect if content changed

// Freshness tracking
lastVerifiedAt DateTime? // when we last confirmed the listing is still live
expiresAt      DateTime? // deadline / expiration if known

// Structured extraction (from LLM)
skillsTags     String[]  // ["Python", "React", "AWS"]
benefitsTags   String[]  // ["401k", "Remote option"]
department     String?   // "Engineering", "Data Science"
experienceReq  String?   // "3-5 years"
educationReq   String?   // "Bachelor's in CS"
workMode       String?   // "remote" | "hybrid" | "onsite"
```

### New model: `ScrapedCompany`
```prisma
model ScrapedCompany {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  website       String
  careerPageUrl String
  logoUrl       String?
  location      String?  // "Kansas City, MO" or "Overland Park, KS"
  techStack     String[] // detected via Wappalyzer-style analysis
  industry      String?
  lastScrapedAt DateTime?
  scraperStatus String   @default("active") // "active" | "broken" | "paused"
  errorCount    Int      @default(0)
  jobsCount     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### New model: `RawJobContent`
```prisma
model RawJobContent {
  id          String   @id @default(cuid())
  jobId       String   @unique
  rawHtml     String   @db.Text  // original career page HTML
  extractedAt DateTime @default(now())
}
```

### New model: `ScraperRun`
```prisma
model ScraperRun {
  id           String   @id @default(cuid())
  companySlug  String
  status       String   // "success" | "partial" | "failed"
  jobsFound    Int      @default(0)
  jobsNew      Int      @default(0)
  jobsUpdated  Int      @default(0)
  duration     Int?     // milliseconds
  errorMessage String?
  runAt        DateTime @default(now())
}
```

---

## 3. File Structure

All new scraper code lives in a dedicated directory:

```
job-search-platform/
├── src/
│   └── lib/
│       └── scraper/              # NEW - all scraper logic
│           ├── index.ts          # Pipeline orchestrator
│           ├── types.ts          # Shared types (NormalizedJob, ScraperConfig)
│           ├── fingerprint.ts    # Dedup fingerprint generation
│           ├── normalizer.ts     # Location, salary, type normalization
│           ├── extractor.ts      # Gemini Flash-Lite structured extraction
│           └── sources/          # One file per company scraper
│               ├── base.ts       # Abstract base scraper class
│               ├── garmin.ts
│               ├── oracle-health.ts
│               ├── tmobile.ts
│               └── ...
├── scripts/
│   ├── import-jsearch-jobs.ts    # EXISTING - Pipeline A
│   ├── run-kc-scrapers.ts        # NEW - Pipeline B entry point
│   └── seed-kc-companies.ts      # NEW - Populate ScrapedCompany table
```

---

## 4. Fingerprint Deduplication

### Layer 1: Deterministic Hash (inline, on insert)
```typescript
function generateFingerprint(company: string, title: string, city: string): string {
  const normalized = [company, title, city]
    .map(s => s.toLowerCase().trim())
    .map(s => s.replace(/\b(inc|llc|corp|pvt|ltd|co)\b\.?/g, '').trim())
    .map(s => s.replace(/\s+/g, ' '))
    .join('|');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
```

On insert: if `fingerprint` collides with existing record, **update** instead of creating duplicate. Prefer scraped data over API data (richer content).

### Layer 2: Fuzzy Similarity (batch, post-ingestion)
Run as a scheduled job. For jobs sharing the same company but different fingerprints:
- Jaccard similarity on tokenized title words
- If `title_similarity > 0.85`, flag as potential duplicate for review

---

## 5. Gemini Flash-Lite Extraction Pipeline

For each scraped job's raw HTML:

1. Strip HTML to meaningful text (remove nav, footer, scripts)
2. Send to Gemini 3.1 Flash-Lite with a structured JSON schema prompt
3. Parse response into `skillsTags`, `benefitsTags`, `department`, `experienceReq`, `educationReq`, `workMode`
4. Store raw HTML in `RawJobContent` for re-extraction if prompt improves

### Prompt template:
```
Extract structured data from this job posting. Return valid JSON only.
{
  "skills": ["skill1", "skill2"],
  "benefits": ["benefit1", "benefit2"],
  "department": "string or null",
  "experience_required": "string or null",
  "education_required": "string or null",
  "work_mode": "remote | hybrid | onsite | null",
  "salary_text": "string or null"
}

Job posting:
{raw_text}
```

### Cost estimate:
- ~500 jobs/day × ~2K tokens/job = ~1M tokens/day
- Gemini 3.1 Flash-Lite: extremely cost-effective for this volume

---

## 6. Scraping Modes

| Mode | When | Behavior |
|------|------|----------|
| **Seed** | First run ever | Hit all career pages. 1-2 sec delay between requests. |
| **Delta** | Daily cron | Compare `rawContentHash`. Only re-scrape changed pages. 3-5 sec delays. Off-peak (2-4 AM CT). |
| **Emergency** | 429 / captcha | Auto back-off. Disable source. Alert via log. |

---

## 7. Verification Plan

### Automated
- Unit tests for `fingerprint.ts` (known inputs → expected hashes)
- Unit tests for `normalizer.ts` (location normalization, salary parsing)
- Integration test: seed 3 test companies → run scraper → verify DB records

### Manual
- Run `seed-kc-companies.ts` → verify `ScrapedCompany` table populated
- Run `run-kc-scrapers.ts` for a single company → verify `Job` records created with correct `sourceType: 'scraped'`
- Verify deduplication: insert same job twice → confirm no duplicate
- Verify LLM extraction: check that `skillsTags` array is populated and reasonable
