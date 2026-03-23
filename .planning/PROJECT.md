# JobScout

## What This Is

A nationwide SaaS job search automation platform. Job seekers sign up, define their search criteria, and JobScout aggregates, normalizes, and surfaces relevant opportunities from 100+ sources into a single intelligent cockpit. Kansas City is the v1 pilot market. The scraper architecture, normalization contract, and cockpit UX built in KC are the template for national scale expansion.

## Core Value

**Give every job seeker a single operating surface where they can discover, triage, and pursue opportunities without losing context — from first sighting to signed offer.**

## Requirements

### Validated

- ✓ Multi-source job ingestion pipeline (JSearch API + direct scraping) — existing
- ✓ Dual-pipeline architecture (API + scraped) with sourceType differentiation — existing
- ✓ Job normalization contract: fingerprint, workMode, seniority, skillsTags, salaryMin/Max — Phase 6 shipped
- ✓ Stale-overwrite protection trigger on Job upsert — Phase 6 shipped
- ✓ Company + ObservedListing + DedupeDecision schema (P1) — Phase 6 shipped
- ✓ HTML→Markdown preprocessing + ATS classifier for LLM cost reduction — Phase 6 shipped
- ✓ CTS (Cloud Talent Solution) semantic search integration — existing
- ✓ Workspace model: one workspace per opportunity per user — existing
- ✓ Resume document state contract: REFERENCE / WORKING_DRAFT / SAVED_VARIANT / SUBMITTED_SNAPSHOT — existing
- ✓ BlockNote rich text notes in workspace — existing
- ✓ Cockpit shell: kanban river + stage-owned workspace panel — existing
- ✓ Triage / JobSwipe feed — existing
- ✓ Google OAuth authentication — existing
- ✓ Prisma + PostgreSQL + Redis stack — existing

### Active

**Phase 1 — Unify Opportunity Model**
- [ ] One source of truth for lifecycle state (resolve Application vs Workspace dual-authority)
- [ ] CRAFTING stage replaces PREP everywhere in code and UI
- [ ] Save / pass / restore / craft / apply all map to one lifecycle model
- [ ] No surface invents its own disconnected status logic

**Phase 2 — Tighten Discovery & Triage**
- [ ] Inbox and JobSwipe share the same active discovery set
- [ ] Multi-select and batch actions in Inbox
- [ ] PASSED becomes a real recoverable bin (not destructive)
- [ ] Search and filter work across discovery set
- [ ] Mobile controls never obscure primary actions

**Phase 3 — Workspace Layer**
- [ ] Every opportunity has exactly one workspace
- [ ] Stage journals replace flat notes (context preserved as opportunity moves)
- [ ] Workspace is the canonical home for notes, blockers, contacts, artifacts
- [ ] Workspace expands in-place from pipeline card (no separate page)

**Phase 4 — Pipeline Movement Rules**
- [ ] Only allowed transitions available per lifecycle contract
- [ ] INTERESTED ↔ CRAFTING: free drag
- [ ] CRAFTING → APPLIED: requires submission package (explicit action, immutable snapshot)
- [ ] Later-stage reversions require explicit correction flow
- [ ] OFFER → ACCEPTED: confirmation dialog + wind-down prompt

**Phase 5 — Artifacts & Application Events**
- [ ] Drafts live in workspace
- [ ] Submitted artifacts become immutable snapshots
- [ ] Application events record when/where/how submitted
- [ ] Resume generation, saving, applying all attach to same opportunity/workspace
- [ ] Voice presets and opportunity-level AI guidance plug into resume input contract

### Out of Scope

- Geocoding / radius-based location enrichment — deferred, map feature paused
- Advanced analytics polish — after core flow is solid
- Broad source expansion beyond KC — after normalization contract proven
- Mobile native apps — web-first
- Plugin marketplace — Phase 5+ roadmap item
- Multi-tenant / white-label — post-national-scale

## Context

- **Pilot market:** Kansas City, MO — 234 jobs currently in DB from JSearch ingestion
- **Target user:** Any professional job seeker; Richard Ruiz acts as UAT test user during KC pilot
- **Scale target:** Lightcast's 160,000-source approach is the design ceiling
- **Tech stack:** Next.js 16 / React 19 / TypeScript / Prisma / PostgreSQL / Redis / Tailwind / shadcn
- **LLM:** Provider-agnostic (OpenAI, Anthropic, Google, Azure, Ollama, OpenRouter)
- **Auth:** Google OAuth via NextAuth
- **Known blockers:** Application + Workspace dual lifecycle authority; resume ownership fragmentation; JSON fields carrying workflow truth (all flagged in CONCERNS.md)
- **Codebase map:** `.planning/codebase/` (7 documents, March 2026)

## Constraints

- **Schema:** Additive-only migrations — never destructive to existing user data
- **Compatibility:** Existing Workspace/Application/Resume rows must survive all Phase 1-5 changes
- **Auth:** Google OAuth is the only auth path currently wired
- **Deployment:** Docker Compose for local dev; SaaS target for production

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Workspace is the canonical lifecycle owner (not Application) | Application is legacy; Workspace was built to supersede it | — Pending Phase 1 resolution |
| sourceUrl + fingerprint dual-dedup strategy | sourceUrl for same-source refresh; fingerprint for cross-source dedup | ✓ Good — shipped Phase 6 |
| Additive-only schema migrations | Protect existing user data across all changes | ✓ Good |
| CTS for semantic search, Postgres as source of truth | CTS is best-effort; Postgres never depends on CTS being up | ✓ Good |
| KC as v1 pilot before national expansion | Validate pipeline architecture at small scale first | — Pending |

---
*Last updated: 2026-03-22 after project initialization*
