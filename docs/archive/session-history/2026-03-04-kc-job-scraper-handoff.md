# KC Job Scraper Project — Handoff for New Session

**Date:** 2026-03-04  
**Purpose:** Everything a new AI session needs to pick up this project without losing context.

---

## System Prompt for New Session

> You are a strategic consultant on this project. You do NOT write code. You do NOT launch research until told. You think, you plan, you question assumptions, you present options with tradeoffs. When you need research done, you describe what research is needed and wait for my go-ahead. You do not react to every comment — you absorb feedback and adjust course deliberately. You own the big picture. You delegate execution.

---

## What This Project Is

An AI-first job aggregation platform for Kansas City. We scrape IT jobs from every employer in the KC metro (not just tech companies — hospitals, government, schools, banks, everyone) and funnel them into an existing Next.js/Prisma/PostgreSQL app alongside API-sourced data (JSearch).

**Strategic insight:** Volume is a feature. The more jobs we surface, the more overwhelming the raw feed → the more our filtering/triage/workspace tools justify a subscription price.

---

## What's Been Decided

1. **No separate branding.** KC scraping is another data pipeline into the existing `job-search-platform`.
2. **IT jobs at ALL employers** — filter for IT relevance at the AI extraction layer, not at the company selection layer.
3. **Dual-pipeline architecture:** Pipeline A (API/bought) + Pipeline B (scraped) → shared normalizer → same DB.
4. **Gemini Flash-Lite** for structured extraction from raw HTML.
5. **Fingerprint dedup:** SHA256 of normalized `company + title + city` + fuzzy similarity fallback.
6. **100+ target companies** identified across 10 sectors (tech, healthcare, government, education, finance, engineering, consumer, logistics, nonprofits).
7. **7 channel tiers** identified for job acquisition (APIs, ATS platforms, government feeds, niche boards, staffing agencies, discovery engines, community).

---

## What Has NOT Been Researched (Critical Gaps)

1. **Best methods for scraping job listings** — No empirical comparison of traditional scraping vs AI extraction vs hybrid vs 3rd approaches. Need cost/benefit analysis (tokens per 100 jobs, accuracy, coverage).
2. **AI scraping tools** — Haven't evaluated Firecrawl, ScrapeGraphAI, Crawl4AI, or other AI-native scraping tools. Haven't looked at what MCP servers or CLI tools exist for intelligent scraping.
3. **schema.org JobPosting data** — Many sites embed structured data that Google for Jobs reads. Could be a zero-LLM-cost extraction method for sites that have it.
4. **Real-world token economics** — No testing of how much it actually costs to extract jobs via Gemini at scale (need: fetch 10 pages → extract → measure tokens → calculate cost per job).
5. **What a senior HR researcher actually knows about job distribution** — Started this research but didn't complete it.

---

## Key Files in the Repo (`/home/richard/code/jobs/`)

| File | Status | What It Contains |
|------|--------|-----------------|
| `JOURNAL.md` | ✅ Good | Chronological decision log, key decisions, feelings |
| `docs/kc-job-acquisition-strategy.md` | ⚠️ Partially updated | 7-tier channel map, AI-first architecture, but written from general knowledge not deep research |
| `docs/kc-scraper-plan.md` | ⚠️ Needs AI-first rewrite | Implementation plan with schema changes, file structure, fingerprinting |
| `docs/decisions/002-kc-scraper-dual-pipeline.md` | ✅ Good | ADR for dual-pipeline architecture |
| `docs/decisions/001-llm-provider-support.md` | ✅ Good | Gemini Flash-Lite for extraction |
| `docs/PRD-OPEN-SOURCE.md` | ✅ Updated | Data sources section includes KC scraper |
| `docs/plans/rearchitecture_and_redesign.md` | ✅ Updated | Pipeline section updated for dual-source |
| `docs/product/OWNER.md` | ✅ Updated | KC scraper status and key files |

## Brain Artifacts

| File | What It Contains |
|------|-----------------|
| `kc_job_board_analysis.md` | Nepal reference site analysis + decisions |
| `kc_target_companies.md` | 100 companies across 10 sectors |

---

## Lessons Learned (How to Work With Richard on This)

1. **Do NOT act without a directive.** Answer questions, present options, wait.
2. **Do NOT rely on general knowledge.** Research first, cite sources, admit gaps.
3. **Think AI-first.** This is an AI project. Every component should leverage AI. Stop defaulting to 1990s approaches.
4. **Present OPTIONS with tradeoffs.** Don't pick one approach and build it. Show 3+ options with cost/effort/quality analysis and let Richard decide.
5. **Be a consultant, not a coder.** Stay at the strategic level. Define research tasks and delegate to subagents. Don't do the grunt work yourself.
6. **The browser subagent uses Richard's actual browser.** Use `read_url_content` for headless HTTP fetches, `search_web` for research. Browser subagents are for testing our own app only.
7. **Don't react to every comment.** Absorb feedback, adjust course, proceed with the actual work.
8. **Run cost/benefit analysis before committing to approaches.** Tokens per job, accuracy rates, coverage percentages — data drives decisions.
9. **Volume is the strategy.** More jobs = more value in our filtering tools. Never limit scope.
10. **Think out of the box.** Assume there are better approaches than what we've considered. Research what we don't know we don't know.

---

## Existing Tech Stack

- **App:** Next.js, Prisma, PostgreSQL, Tailwind CSS
- **Auth:** Clerk/NextAuth
- **Current data source:** JSearch API (Google for Jobs aggregator)
- **Schema:** See `job-search-platform/prisma/schema.prisma`
- **Scripts:** See `job-search-platform/scripts/import-jsearch-jobs.ts`

---

## What to Do Next

1. **Research the best possible methods for scraping job listings** — empirically, not from general knowledge. Compare traditional, AI-native, hybrid, and anything else that exists.
2. **Test token economics** — fetch real career pages, extract with Gemini, measure cost per job.
3. **Present options with tradeoffs** — let Richard choose the approach.
4. **Then** build the pipeline.
