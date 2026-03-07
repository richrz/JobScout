# KC Job Acquisition Strategy — AI-First, Research-Backed

> **Goal:** Capture every IT job posted in the Kansas City metro from every channel.
> Volume is the strategy. Our filtering/triage tools justify the subscription.

**Date:** 2026-03-04  
**Status:** Active Strategy Reference  
**Architecture:** AI-first. Gemini is the scraper, the parser, the filter, and the categorizer.  
**Research basis:** Labor market analyst methods, workforce intelligence platforms, staffing industry data, sector-specific board directories.

> This is a sourcing strategy reference for the KC acquisition workstream. It supports, but does not replace, the main product implementation roadmap.

---

## Key Research Finding

**50-85% of jobs are never publicly posted** (NACE 2023: 60%, various industry studies: 70-85%). They're filled through internal hiring, referrals, staffing agencies, and niche channels. This means the aggregators (Indeed, LinkedIn, JSearch) are showing at most half the market. Our edge is tapping the other half.

---

## Core Architecture — AI Does Everything

The pipeline for ANY source (career page, job board, staffing agency, government portal):

```
URL list → HTTP fetch → Gemini Flash-Lite → Structured JSON → Dedup → Database
```

1. **Fetch** — HTTP GET the page (no browser, no clicking)
2. **Extract** — Send raw HTML to Gemini: "Extract all job listings as structured JSON" → get title, company, location, salary, skills, description regardless of page layout
3. **Classify** — Gemini determines IT relevance, categorizes by skill domain, extracts experience level
4. **Dedup** — Fingerprint (SHA256 of normalized company + title + city) + fuzzy similarity
5. **Store** — Into the shared Job table with source tracking

**The LLM replaces all traditional parsing infrastructure.** No CSS selectors. No site-specific adapters. No rules to maintain when layouts change. Feed it any career page from any company and it extracts structured data. This is how we scale to 100, 900, or 5,000 sites with the same codebase.

**Reference:** Lightcast (2.5B postings, 160K sources) uses spider-based crawling + NLP extraction. We use the same pattern but with modern LLMs instead of custom NLP pipelines.

---

## The Complete Channel Map

### TIER 1 — Paid Data Feeds (buy the firehose, filter for KC + IT)

| Source | What It Does | KC Relevance | Cost |
|--------|-------------|--------------|------|
| **JSearch API** (existing) | Google for Jobs aggregator | High — already integrated | $50-300/mo |
| **Workday Jobs API** (RapidAPI / Fantastic.jobs) | Searches ALL Workday clients by location. One call finds Fortune 500s, hospitals, banks with KC offices you didn't know about. | Very high | ~$50/mo |
| **JobsPikr** | Custom job feeds with ML dedup, location filter, daily delivery. 160K+ source coverage. | High | $4K/yr |
| **Adzuna API** | Free tier aggregator with US/KC coverage | Medium | Free tier |
| **Coresignal** | Company employment data — find who has KC employees | Discovery | Enterprise |
| **People Data Labs** | Company career page monitoring — jobs before aggregators | High | $$ |

**Why Workday API is the single highest-value addition:** Workday is the ATS for most Fortune 500s, hospital systems, banks, and universities. A Nashville hospital chain with 200 KC employees? A Charlotte bank with a KC operations center? Workday catches them. You never need to know the company exists.

### TIER 2 — ATS Platform APIs (structured data shortcuts)

Some ATS platforms expose APIs or consistent data formats. These are **optimizations** — faster and cleaner than LLM extraction, but not required. The generic AI pipeline handles any site regardless.

| ATS Platform | Market | Structured Access |
|-------------|--------|------------------|
| **Workday** | Enterprise, healthcare, finance, universities | `myworkdayjobs.com` + RapidAPI |
| **Greenhouse** | Tech companies, growth-stage | `boards.greenhouse.io` — REST API, JSON |
| **Lever** | Startups, mid-size tech | `jobs.lever.co` — native JSON feeds |
| **NeoGov** | Government (13,000+ agencies) | `governmentjobs.com` — REST API |
| **SmartRecruiters** | Mixed | Public API, location search |

For ATS platforms without clean APIs (iCIMS, Taleo, BambooHR, custom sites), the generic AI pipeline handles them — fetch HTML, send to Gemini, get structured JSON.

### TIER 3 — Government Data Feeds (structured, salary-transparent, stable)

| Source | Coverage | Access Method |
|--------|---------|--------------|
| **USAJOBS** | All federal KC jobs (IRS, VA, DoD, GSA, EPA, FBI, Fed Reserve) | Official REST API. Free. JSON. Location code filter. |
| **kcgovjobs.org (MARC)** | 23 KC municipalities/counties (Johnson Co, Jackson Co, KCMO, OP, Independence, Lee's Summit, etc.) | Clean DOM, keyword search, IT category. |
| **GovernmentJobs.com (NeoGov)** | 13,000+ gov agencies nationwide. Filter to KC area. | NeoGov REST API. |
| **jobs.ks.gov** | Kansas state agency jobs in KC area | State portal |
| **mocareers.mo.gov** | Missouri state agency jobs in KC area | State portal |

### TIER 4 — Sector-Specific Niche Boards

These boards serve specific industries. IT jobs exist in every sector.

**Healthcare:**

| Board | Coverage |
|-------|---------|
| Health eCareers | Clinical + health IT, nationwide |
| HospitalCareers | 5,000+ hospitals, includes IT roles |
| CareerVitals | 4M+ users, health admin + IT |
| HealthJobsNationwide | 1.5M listings, filter for KC |

**Education:**

| Board | Coverage |
|-------|---------|
| EdJoin | National education board — low KC volume but catches school IT |
| SchoolSpring | K-12 education jobs, IT support roles |
| K12JobSpot | Every K-12 district in US, technology category |
| HigherEdJobs | University faculty + staff — IT departments |
| EducateKansas.org | Kansas education-specific |

**Tech/Startup Ecosystem:**

| Board | Coverage |
|-------|---------|
| BuiltIn Kansas City | Curated KC tech companies + jobs |
| Dice | IT/tech specialist board, filter to KC |
| Startland News | KC startup ecosystem, jobs + company discovery |
| AngelList/Wellfound | Startup jobs, filter to KC |
| KC Tech Council | Curated KC tech ecosystem |
| KCSourceLink | KC startup resource hub, company directory |

**Defense/Cleared:**

| Board | Coverage |
|-------|---------|
| ClearedJobs.net | Security-cleared IT roles (Fort Leavenworth, defense contractors) |
| ClearanceJobs.com | Same niche |

### TIER 5 — Staffing Agency Feeds

Staffing agencies post contract/contract-to-hire roles that **never appear on the employer's own career page**. A "Senior Java Developer at Cerner" might exist only on a staffing agency's board.

**KC-Specific Agencies:**
TriCom Technical Services (30+ yrs KC) · nexus IT group (KC exclusive) · ProFocus Technology · Morgan Hunter · SNI Technology · Beacon Hill Technologies · Spencer Reed Group · Parallel Partners

**National Agencies with KC Presence:**
Robert Half Technology · TEKsystems · Insight Global · Randstad Technologies · Kforce · Modis/Adecco

### TIER 6 — Discovery Engines (find employers you don't know about)

These don't give you jobs directly — they reveal companies with KC presence that you should add to your ATS/career page scraper lists.

| Method | What It Finds |
|--------|-------------|
| **Workday/Greenhouse location search** | Companies with KC jobs that you never knew had KC offices |
| **LinkedIn Company Search** | Filter: 50+ employees, "Kansas City Metropolitan Area" — reveals satellite offices |
| **KCADC (KC Area Development Council)** | Tracks companies relocating to / expanding in KC |
| **JCEDAC (Johnson County Economic Dev)** | Every company with JoCo offices |
| **Google Alerts** | "Kansas City" + ("new office" OR "expanding" OR "relocating") |
| **KCSourceLink company directory** | KC startup/business directory |
| **StartupBlink** | KC ranked in startup ecosystem — company list |
| **Mid-American Angels portfolio** | Angel-funded KC companies = hiring |
| **University career centers** (KU, UMKC, JCCC) | Their employer partners reveal companies recruiting in KC |
| **Commercial real estate** | Who's leasing 50K+ sqft in KC = who's hiring |
| **Conference sponsor pages** (KCDC, KC tech events) | Sponsors = companies with KC hiring budgets |

### TIER 7 — Community / Social Channels

| Channel | Signal |
|---------|--------|
| KC Tech Group Slack #jobs | Jobs posted before anywhere else |
| SecKC Slack | InfoSec roles |
| KCWiT Slack | Tech jobs shared in community |
| r/kansascity job threads | Local job intel |
| Meetup.com groups (GDG KC, KCDNUG) | Sponsor companies = hiring |

---

## Infrastructure

### The AI Pipeline (our core — handles any site)

```
[URL Database] → [Scheduler/Crawler] → [HTTP Fetch] → [Gemini Flash-Lite] → [Dedup] → [PostgreSQL]
```

- **Crawler:** Scheduled HTTP fetches. Crawlee (Node) or Scrapy (Python) for queue management, retries, rate limiting.
- **LLM Extraction:** Gemini Flash-Lite. Send raw HTML → receive structured JSON. Works on ANY page layout.
- **LLM Classification:** Same Gemini call determines IT relevance, skill extraction, experience level, work mode.
- **Dedup:** SHA256 fingerprint + fuzzy similarity.
- **Anti-bot (when needed):** ScrapingBee or ScraperAPI ($29/mo) for proxy rotation on protected sites.

### Paid data services (supplement, not replace)

| Service | Value | Cost |
|---------|-------|------|
| **JobsPikr** | Pre-crawled feeds from 160K+ sources, ML dedup, KC location filter | $4K/yr |
| **Apify** | Pre-built actors for major platforms (Workday, Greenhouse, LinkedIn) | $49/mo |
| **ScrapingBee** | Proxy rotation for anti-bot protected sites | $29/mo |

---

## Recommended Priority (Phase Order)

### Phase 1 — APIs (Week 1-2, est. 2,000+ jobs/month)

1. Keep JSearch (existing)
2. Add Workday Jobs API (RapidAPI) — one API, hundreds of enterprise employers
3. Add USAJOBS API — free, official, federal KC jobs
4. Add Adzuna API — free tier

### Phase 2 — ATS Aggregation + Government (Week 3-4, est. +1,000 jobs/month)

5. Greenhouse scraper (Apify actor or custom)
6. Lever scraper (JSON feeds)
7. kcgovjobs.org scraper
8. NeoGov / GovernmentJobs.com scraper

### Phase 3 — Niche Boards + Staffing (Week 5-6, est. +500 jobs/month)

9. Staffing agency feed scrapers (TriCom, TEKsystems, Robert Half)
10. BuiltIn KC, Dice filtered feeds
11. Healthcare boards (HospitalCareers, Health eCareers)
12. Education boards (K12JobSpot, HigherEdJobs)

### Phase 4 — Discovery + Expansion (Ongoing)

13. Run LinkedIn/Workday location searches to find new employers
14. Set up Google Alerts for new KC office announcements
15. Monitor KCADC, economic development databases
16. Community channel monitoring

### Estimated Total: 2,500-4,000 unique IT jobs/month in KC metro

After deduplication across all sources.

---

## What's Different From Draft 1

| Draft 1 (general knowledge) | This version (research-backed) |
|-----------------------------|-------------------------------|
| Listed 8 channels from intuition | Channels derived from actual labor market analyst toolkits |
| Missed sector-specific boards entirely | Healthcare (5 boards), Education (5 boards), Defense (2 boards) |
| Missed EdJoin, SchoolSpring, K12JobSpot | Now included with coverage notes |
| Didn't know about NeoGov (13K gov agencies) | Now a key Tier 3 source with API access |
| "Click through sites" scraping approach | Purpose-built tools: Apify, Octoparse, JobsPikr, Browse AI |
| Missed Silicon Prairie ecosystem | KCSourceLink, Startland News, Mid-American Angels, StartupBlink |
| No mention of Lightcast methodology | Now using their spider/dedup/NLP approach as our design model |
| Missed staffing agency channel depth | 8 KC-specific + 6 national agencies identified |
| Missed discovery engines entirely | 11 methods for finding new employers continuously |
| Missed cleared/defense job boards | ClearedJobs.net, ClearanceJobs.com for Fort Leavenworth area |
