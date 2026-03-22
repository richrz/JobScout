# Codebase Concerns & Technical Debt

**Status:** Active analysis
**Date:** 2026-03-22
**Scope:** JobScout job-search-platform codebase

---

## Executive Summary

The codebase is in a transitional state between legacy patterns and new architecture. While the recent pipeline architecture work (P0/P1 migrations) is solid, there are significant structural risks around data model fragmentation, incomplete error handling, and untyped JSON fields carrying workflow logic. The product roadmap explicitly flags these as known risks that must be resolved before further extension.

---

## Critical Issues

### 1. Dual Lifecycle Authority — Application vs Workspace Status

**Severity:** HIGH
**Impact:** Data inconsistency, user confusion, hard-to-debug state bugs

**Problem:**
- `Application.status` and `Workspace.status` both carry lifecycle meaning
- No single source of truth for opportunity state
- Same opportunity can have conflicting status values across tables
- Roadmap explicitly identifies this as a blocker (see `current-implementation-roadmap.md` line 76)

**Current State:**
- `Application` model has `status` field (default: "discovered")
- `Workspace` model has `status` field (enum: INTERESTED, APPLIED, FOLLOW_UP, DORMANT, ARCHIVED, PASSED)
- Multiple surfaces (Pipeline, Inbox, Resume Builder) query different tables for state
- No enforcement of consistency between the two

**Risk:**
- User moves opportunity to APPLIED in Pipeline (updates Workspace)
- Legacy code path queries Application.status and sees "discovered"
- Batch operations may operate on stale state
- Migrations will be complex when consolidating

**Recommendation:**
- Phase 1 of roadmap must resolve this before adding new features
- Choose one authoritative model (likely Workspace based on current usage)
- Deprecate Application.status or migrate it to a read-only computed field
- Add database constraints to prevent divergence

---

### 2. JSON Fields as Workflow Truth

**Severity:** HIGH
**Impact:** Unqueryable state, schema drift, data integrity issues

**Problem:**
- Multiple JSON fields carry structured workflow data:
  - `Profile.workHistory[]` (legacy, to be migrated)
  - `Profile.education[]` (legacy, to be migrated)
  - `Application.statusHistory[]` (audit trail)
  - `Config.searchParams`, `Config.llmConfig`, `Config.dailyCaps`
  - `Workspace.content` (resume/artifact metadata)
  - `Workspace.feedback` (LLM feedback)
- No schema validation on JSON content
- Queries cannot filter on nested JSON fields efficiently
- Migrations require manual data transformation
- Roadmap explicitly flags this as a decision gate (line 73)

**Current State:**
- `Profile` has both `workHistory: Json[]` and `experiences: WorkExperience[]` (dual representation)
- `Config` stores search parameters as untyped JSON
- No Zod/validation schemas for JSON structure
- No database constraints on JSON shape

**Risk:**
- Inconsistent data shapes across records
- Queries that should be simple become complex
- Impossible to enforce required fields in JSON
- Hard to track what data is actually stored
- Performance degradation as JSON grows

**Recommendation:**
- Define explicit Zod schemas for all JSON fields
- Migrate legacy JSON fields to proper tables (workHistory → WorkExperience, education → Education)
- Add runtime validation on all JSON writes
- Consider pgvector or JSONB operators for queryable JSON
- Establish a "no new JSON fields" policy

---

### 3. Resume Ownership Fragmentation

**Severity:** HIGH
**Impact:** Duplicate data, unclear source of truth, complex resume generation

**Problem:**
- Resume ownership split across three places:
  - `Resume` table (canonical resume records)
  - `Artifact` table (workspace-attached artifacts)
  - `Application.resumePath` (legacy path reference)
- No clear ownership model for working drafts vs submitted snapshots
- Workspace resume service (`workspace-resume-service.ts`) creates Resume records but relationship to Artifact unclear
- Resume generation logic doesn't have a single entry point

**Current State:**
- `Resume` model has `workspaceId`, `jobId`, `userId`, `content`, `documentState`
- `Artifact` model has `workspaceId`, `type`, `content`, `metadata`
- `Application` has `resumePath` string field
- Multiple routes create/update resumes: `/api/resume/save`, `/api/resume/generate`, workspace service

**Risk:**
- User generates resume for Job A, then applies to Job B with same resume
- Unclear which Resume record is the "current" one
- Workspace expansion shows artifacts but resume generation uses Resume table
- Migrations will require deduplication logic

**Recommendation:**
- Define explicit ownership model: one Resume per Workspace per Job
- Deprecate Application.resumePath
- Consolidate Resume and Artifact into single model or clear hierarchy
- Add unique constraints to prevent duplicates
- Document resume lifecycle: draft → locked → submitted → archived

---

### 4. Untyped `any` Usage in Critical Paths

**Severity:** MEDIUM
**Impact:** Type safety gaps, runtime errors, harder refactoring

**Problem:**
- `@ts-ignore` used in analytics dashboard (`/api/analytics/dashboard/route.ts:39`)
- Multiple `any` casts in profile import service
- Workspace data structures use `any` in form handling
- Application actions use untyped destructuring

**Current State:**
```typescript
// analytics/dashboard/route.ts:39
// @ts-ignore
counts[group.status] = group._count.status;

// profile/route.ts:76
create: (data.experiences || []).map((e: any) => ({...}))
```

**Risk:**
- Type checker cannot catch errors
- Refactoring breaks silently
- IDE autocomplete doesn't work
- Harder to onboard new developers

**Recommendation:**
- Remove all `@ts-ignore` comments
- Define proper types for all data structures
- Use Zod for runtime validation of external input
- Enable `noImplicitAny` in tsconfig if not already set

---

## High-Priority Issues

### 5. Missing Session/Auth in Resume Save Endpoint

**Severity:** HIGH
**Impact:** Security vulnerability, data isolation failure

**Problem:**
- `/api/resume/save/route.ts` has TODO comment: "Get actual userId from session"
- Currently uses mock userId: `const mockUserId = userId || 'mock-user-id'`
- Accepts userId from request body without validation
- No session verification before saving resume

**Current State:**
```typescript
// TODO: Get actual userId from session
const mockUserId = userId || 'mock-user-id';
```

**Risk:**
- User A can save resume as User B by passing userId in request
- Multi-tenant data isolation broken
- Audit trail unreliable
- Production deployment would expose user data

**Recommendation:**
- Extract userId from NextAuth session (like other routes do)
- Remove userId from request body
- Add session verification middleware
- Add integration test for auth enforcement

---

### 6. Incomplete Error Reporting Infrastructure

**Severity:** MEDIUM
**Impact:** Blind spots in production monitoring, hard to debug issues

**Problem:**
- `error-reporting.ts` has TODO: "Integrate with external monitoring service"
- Currently only logs to console
- No Sentry, Slack, or email integration
- No structured error context in most error handlers
- Many catch blocks just log without context

**Current State:**
```typescript
// error-reporting.ts:18
// TODO: Integrate with external monitoring service (e.g., Sentry, Slack webhook)
```

**Risk:**
- Production errors go unnoticed
- No alerting for critical failures
- Hard to correlate errors across requests
- No error rate tracking or anomaly detection

**Recommendation:**
- Integrate Sentry for error tracking
- Add structured logging with context (userId, jobId, operation)
- Set up alerts for error rate spikes
- Document error codes and recovery strategies

---

### 7. Embedding Tier Dedup Not Implemented

**Severity:** MEDIUM
**Impact:** Duplicate jobs in database, incomplete dedup pipeline

**Problem:**
- `dedup-worker.ts` has TODO: "implement when pgvector is available"
- Tier 3 (embedding similarity) stubbed, returns 'uncertain'
- Uncertain listings queue indefinitely without resolution
- No fallback to LLM-based dedup

**Current State:**
```typescript
// dedup-worker.ts:132
// TODO: implement when pgvector is available.
// For now, return 'uncertain' so listings queue for future resolution.
return {
    outcome: 'uncertain',
    method: 'embedding',
    similarity: undefined,
    llmReasoning: 'Embedding tier not yet implemented — queued for future resolution',
};
```

**Risk:**
- At scale, many jobs will remain undeduped
- Database grows with duplicates
- User sees same job multiple times
- Dedup audit trail incomplete

**Recommendation:**
- Implement pgvector extension in Postgres
- Add embedding generation for job descriptions
- Set similarity threshold (0.90 for "same", 0.75–0.90 for "uncertain")
- Add LLM fallback for uncertain cases
- Monitor dedup metrics (linked %, uncertain %, no-match %)

---

### 8. No Pagination on Large Queries

**Severity:** MEDIUM
**Impact:** Memory exhaustion, slow page loads, poor UX at scale

**Problem:**
- 30+ database queries use `findMany()` without `take`/`skip`
- Examples: `/api/jobs`, `/api/cockpit/pipeline`, `/api/triage/feed`
- No cursor-based pagination implemented
- Dashboard queries fetch all workspaces without limit

**Current State:**
```typescript
// cockpit/pipeline/route.ts:29
const workspaces = await prisma.workspace.findMany({
    where: { userId },
    // No take/skip — fetches ALL workspaces
});

// jobs/route.ts:62
? await prisma.job.findMany({
    // No pagination
})
```

**Risk:**
- User with 10k jobs loads entire table into memory
- API response times degrade linearly with data size
- Network bandwidth wasted
- Mobile clients timeout

**Recommendation:**
- Add cursor-based pagination to all list endpoints
- Default `take: 50`, max `take: 500`
- Use Prisma cursor pagination pattern
- Add tests for pagination edge cases
- Document pagination in API contracts

---

### 9. Temporary Debug Code in Production Paths

**Severity:** MEDIUM
**Impact:** Unexpected behavior, data loss, confusion

**Problem:**
- `/api/profile/route.ts` has commented-out debug code:
  ```typescript
  // [TEMPORARY DEBUG] Prevent browser auto-save from overwriting seed data
  // return NextResponse.json({ message: "Update temporarily disabled for seeding" });
  ```
- Suggests profile updates were disabled during development
- No clear when/why this was added or if it's safe to remove

**Current State:**
- Code is commented out but still in production
- No ticket tracking why it was disabled
- No test coverage for profile updates

**Risk:**
- Confusion about whether profile updates work
- If uncommented accidentally, breaks user workflows
- Seed data assumptions may be stale

**Recommendation:**
- Remove commented debug code
- Add proper seed data isolation (separate test database)
- Document any intentional feature flags
- Add integration tests for profile updates

---

## Medium-Priority Issues

### 10. Stale Overwrite Guard Relies on Timestamps

**Severity:** MEDIUM
**Impact:** Race conditions, data loss in concurrent scenarios

**Problem:**
- P0 migration added `job_stale_overwrite_guard` trigger
- Silently drops writes if `lastExtractedAt` is older than database record
- No logging of dropped writes
- No way to know if update was rejected

**Current State:**
```sql
-- Postgres BEFORE UPDATE trigger
-- Silently drops stale worker writes
```

**Risk:**
- Worker processes job in parallel, both try to update
- Slower worker's update silently dropped
- No audit trail of what happened
- Hard to debug "why didn't my update work?"

**Recommendation:**
- Log all rejected updates to audit table
- Return error to caller instead of silent drop
- Add metrics for stale-write rejection rate
- Consider optimistic locking with version field

---

### 11. Mock Mode Scattered Throughout Codebase

**Severity:** MEDIUM
**Impact:** Inconsistent behavior, hard to test, production risk

**Problem:**
- `NEXT_PUBLIC_MOCK_MODE` environment variable checked in multiple places
- Geocoding service has mock mode (`geocoding.ts:28`)
- Auth has dev-login endpoint
- No centralized mock mode configuration
- Easy to forget mock mode in new features

**Current State:**
- `geocoding.ts` checks `NEXT_PUBLIC_MOCK_MODE`
- `/api/auth/dev-login` checks `NODE_ENV === 'development'`
- `/api/auth/single-user` checks `SINGLE_USER_MODE`
- Multiple different patterns

**Risk:**
- Inconsistent mock behavior across features
- Mock data leaks into production if flag not set correctly
- Hard to test with/without mocks
- New developers don't know which pattern to follow

**Recommendation:**
- Create centralized `mockMode.ts` utility
- Document mock mode strategy in architecture guide
- Use feature flags instead of environment variables
- Add tests for both mock and real modes

---

### 12. Config Management Complexity

**Severity:** MEDIUM
**Impact:** Hard to configure, inconsistent behavior, deployment issues

**Problem:**
- Multiple config sources: `.env`, `.env.local`, `.env.example`
- LLM provider config has fallback chain: `ANTHROPIC_API_KEY` → `OPENAI_API_KEY` → `OPENROUTER_API_KEY`
- ZAI config has 6 different env var names checked in sequence
- No validation that required config is present
- No clear documentation of config precedence

**Current State:**
```typescript
// zai-config.ts
process.env.JOBSCOUT_ZAI_API_KEY ||
process.env.API_KEY ||
process.env.ZAI_API_KEY ||
// ... more fallbacks
```

**Risk:**
- Wrong API key used if multiple are set
- Deployment fails silently if config missing
- Hard to debug "why is it using the wrong provider?"
- New developers don't know which env var to set

**Recommendation:**
- Create centralized config validation with Zod
- Fail fast on startup if required config missing
- Document config precedence clearly
- Use single canonical env var names
- Add config validation tests

---

### 13. Lifecycle Automation Lacks Observability

**Severity:** MEDIUM
**Impact:** Silent failures, hard to debug automation issues

**Problem:**
- `lifecycle-service.ts` runs batch updates without transaction safety
- No error handling if update fails mid-batch
- Logs only final counts, not individual failures
- No way to know which workspaces failed to transition

**Current State:**
```typescript
// lifecycle-service.ts:53
const appliedToFollowUp = await prisma.workspace.updateMany({
    where: { status: 'APPLIED', updatedAt: { lt: thirtyDaysAgo } },
    data: { status: 'FOLLOW_UP' }
});
// Only logs final count, not which records failed
```

**Risk:**
- Some workspaces don't transition but no error reported
- Cron job appears successful but data is inconsistent
- Hard to debug "why is this workspace still APPLIED?"

**Recommendation:**
- Wrap batch updates in transaction
- Log individual failures with workspace IDs
- Add metrics for transition counts
- Implement retry logic for failed transitions
- Add alerting for high failure rates

---

### 14. Notes Model Too Flat for Stage Journals

**Severity:** MEDIUM
**Impact:** Lost context, hard to track opportunity history

**Problem:**
- `WarRoomNote` model stores flat notes without stage context
- No way to query "what happened in CRAFTING stage?"
- Notes don't capture which stage they were created in
- Roadmap identifies this as a blocker (line 78)

**Current State:**
```prisma
model WarRoomNote {
  id String @id @default(cuid())
  workspaceId String
  content String @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // No stage field, no type field
}
```

**Risk:**
- User can't see "what was the blocker in SCREENING?"
- Notes accumulate without context
- Hard to understand opportunity journey
- Workspace expansion won't show stage-specific context

**Recommendation:**
- Add `stage` field to WarRoomNote (enum: NEW, INTERESTED, CRAFTING, APPLIED, SCREENING, INTERVIEW, OFFER)
- Add `type` field (note, blocker, contact, action)
- Add `metadata` JSON for stage-specific data
- Create stage-journal view that groups notes by stage
- Add tests for stage journal queries

---

## Low-Priority Issues

### 15. Console Logging in Production Code

**Severity:** LOW
**Impact:** Noise in logs, potential information leakage

**Problem:**
- Multiple `console.log` and `console.error` calls in production code
- No structured logging framework
- Logs go to stdout without context
- Hard to filter/search logs

**Current State:**
- `scheduler.ts` logs startup messages
- `workspace-service.ts` logs workspace creation
- `lifecycle-service.ts` logs automation results
- `session-manager.ts` logs session operations
- `auth.ts` logs user signin/signout

**Risk:**
- Sensitive data might be logged
- Hard to correlate logs across requests
- No log levels or filtering
- Difficult to debug in production

**Recommendation:**
- Replace console.log with structured logger (Winston, Pino)
- Add request ID for correlation
- Use appropriate log levels (debug, info, warn, error)
- Sanitize sensitive data before logging
- Add log aggregation (CloudWatch, Datadog)

---

### 16. Missing Input Validation on API Routes

**Severity:** LOW
**Impact:** Unexpected errors, poor error messages

**Problem:**
- Most API routes don't validate request body shape
- No Zod schemas for request/response types
- Error messages are generic ("Internal Server Error")
- Hard to debug client-side issues

**Current State:**
```typescript
// Most routes do basic checks but no schema validation
const { jobId, resumePath, userId } = await request.json();
if (!jobId || !resumePath) {
    return NextResponse.json({ error: '...' }, { status: 400 });
}
```

**Risk:**
- Client sends malformed data, gets generic error
- No type safety between client and server
- Hard to document API contracts
- Easier to introduce bugs

**Recommendation:**
- Create Zod schemas for all request/response types
- Add validation middleware
- Return detailed error messages
- Generate OpenAPI docs from schemas
- Add client-side type generation

---

### 17. Test Coverage Gaps

**Severity:** LOW
**Impact:** Regressions, hard to refactor safely

**Problem:**
- Limited test coverage for critical paths
- No tests for dedup worker
- No tests for lifecycle automation
- E2E tests exist but coverage unclear
- No integration tests for API routes

**Current State:**
- `jest.config.js` exists but test directory structure unclear
- Playwright tests for E2E
- No unit tests for business logic

**Risk:**
- Refactoring breaks things silently
- Regressions in production
- Hard to verify bug fixes

**Recommendation:**
- Add unit tests for dedup worker
- Add integration tests for API routes
- Add tests for lifecycle automation
- Aim for 80%+ coverage on critical paths
- Add pre-commit hook to run tests

---

### 18. Database Indexes May Be Incomplete

**Severity:** LOW
**Impact:** Slow queries, poor performance at scale

**Problem:**
- P0/P1 migrations added indexes but coverage unclear
- No analysis of slow queries
- No query performance monitoring
- Composite indexes may be missing

**Current State:**
- Job table has 12 indexes
- Workspace table indexes not visible in schema excerpt
- No query analysis or EXPLAIN plans

**Risk:**
- Queries slow down as data grows
- Unexpected performance cliffs
- Hard to debug "why is this slow?"

**Recommendation:**
- Run EXPLAIN ANALYZE on all common queries
- Add missing indexes for filter/sort combinations
- Monitor query performance in production
- Set up slow query logging
- Document index strategy

---

## Architectural Concerns

### 19. Dual-Pipeline Scraper Architecture Not Fully Integrated

**Severity:** MEDIUM
**Impact:** Incomplete feature, unclear data flow

**Problem:**
- ADR 002 defines dual-pipeline scraper architecture
- P0/P1 migrations implement dedup infrastructure
- But integration with actual scraper unclear
- No clear entry point for job ingestion
- ObservedListing table exists but population mechanism unclear

**Current State:**
- `dedup-worker.ts` processes ObservedListings
- But no code visible that creates ObservedListings
- Scraper integration point not documented
- N8N mentioned in docs but not in codebase

**Risk:**
- Scraper and dedup pipeline may not work together
- Data flow unclear to new developers
- Hard to debug ingestion issues

**Recommendation:**
- Document complete data flow from scraper to canonical Job
- Add integration tests for scraper → dedup → Job
- Create clear API contract for scraper output
- Add observability to ingestion pipeline

---

### 20. Cockpit UI Architecture Partially Implemented

**Severity:** MEDIUM
**Impact:** Incomplete feature, UX inconsistency

**Problem:**
- Cockpit interaction spec defined in docs
- Prototype exists (`/cockpit-drawer-wireframe`)
- Production cockpit exists (`/dashboard-wireframe`)
- But unclear which is canonical
- T-shape visual architecture partially implemented
- Stage toolbar wiring incomplete

**Current State:**
- Multiple cockpit-related routes
- Unclear which is the "real" cockpit
- Workspace expansion may not work as spec'd
- Stage transitions may not be fully wired

**Risk:**
- Users see inconsistent UI
- Features work in prototype but not production
- Hard to know which code to modify

**Recommendation:**
- Consolidate cockpit routes into single canonical implementation
- Document which routes are deprecated
- Complete stage toolbar wiring
- Add E2E tests for cockpit interactions
- Verify against cockpit-interaction-spec.md

---

## Data Quality Concerns

### 21. Normalization Version Tracking Incomplete

**Severity:** MEDIUM
**Impact:** Data quality issues, hard to migrate

**Problem:**
- P0 migration added `normalizationVersion` field
- 158 pre-P0 records backfilled with version '1.0'
- But unclear what version '1.0' means
- No versioning strategy for future changes
- No way to know if a record needs re-normalization

**Current State:**
- `normalizationVersion` is nullable string
- 234 KC jobs have version '1.0'
- Pre-P0 records have NULL version
- No migration path for version upgrades

**Risk:**
- Future normalization changes break old records
- Can't query "which records need re-normalization?"
- Hard to debug "why is this record different?"

**Recommendation:**
- Document normalization version semantics
- Create migration strategy for version upgrades
- Add query to find records needing re-normalization
- Add tests for normalization version handling

---

### 22. Record Confidence Not Used in Queries

**Severity:** LOW
**Impact:** Low-quality data used in decisions

**Problem:**
- P0 migration added `recordConfidence` field (0.0–1.0)
- But no code uses it to filter results
- No threshold for "good enough" confidence
- No way to know if a record is reliable

**Current State:**
- `recordConfidence` is nullable float
- No queries filter by confidence
- No documentation of what confidence means

**Risk:**
- Low-confidence records used in resume generation
- User sees unreliable job data
- Hard to debug "why is this data wrong?"

**Recommendation:**
- Document confidence scoring algorithm
- Add confidence threshold to queries (e.g., >= 0.8)
- Add UI indicator for low-confidence data
- Add tests for confidence filtering

---

## Security Concerns

### 23. No Rate Limiting on API Routes

**Severity:** MEDIUM
**Impact:** Abuse, DoS vulnerability

**Problem:**
- No rate limiting on any API routes
- Resume generation endpoint could be abused
- No protection against brute force
- No quota enforcement

**Current State:**
- All routes accept unlimited requests
- No middleware for rate limiting
- No tracking of request rates

**Risk:**
- Attacker floods resume generation endpoint
- LLM API costs spike
- Service becomes unavailable

**Recommendation:**
- Add rate limiting middleware (e.g., `express-rate-limit`)
- Set per-user limits (e.g., 10 requests/minute)
- Add per-IP limits for unauthenticated endpoints
- Monitor rate limit violations
- Add alerting for abuse patterns

---

### 24. Environment Variables Not Validated at Startup

**Severity:** MEDIUM
**Impact:** Silent failures, production issues

**Problem:**
- No validation that required env vars are set
- App starts even if API keys missing
- Errors only appear when feature is used
- No clear error messages

**Current State:**
- Config loaded on-demand
- No startup validation
- Errors are runtime exceptions

**Risk:**
- Deploy without API key, app starts but fails later
- Hard to debug "why is LLM not working?"
- Production outage instead of deployment failure

**Recommendation:**
- Create startup validation script
- Check all required env vars before app starts
- Fail fast with clear error messages
- Document required env vars
- Add pre-deployment checks

---

## Documentation Gaps

### 25. Data Model Documentation Incomplete

**Severity:** LOW
**Impact:** Confusion, wrong assumptions

**Problem:**
- Schema has many fields without clear documentation
- Relationship between Application and Workspace unclear
- Resume ownership model not documented
- No ER diagram

**Current State:**
- Prisma schema has some comments
- But many fields lack explanation
- No separate data model documentation

**Risk:**
- New developers make wrong assumptions
- Bugs from misunderstanding relationships
- Hard to onboard

**Recommendation:**
- Create data model documentation with ER diagram
- Document each table's purpose and relationships
- Explain Application vs Workspace distinction
- Document resume ownership model
- Add examples of common queries

---

## Summary Table

| Issue | Severity | Category | Status |
|-------|----------|----------|--------|
| Dual lifecycle authority | HIGH | Architecture | Roadmap blocker |
| JSON as workflow truth | HIGH | Data Model | Roadmap blocker |
| Resume ownership fragmentation | HIGH | Data Model | Roadmap blocker |
| Untyped `any` usage | MEDIUM | Code Quality | Fixable |
| Missing session auth in resume save | HIGH | Security | Critical fix |
| Incomplete error reporting | MEDIUM | Observability | Planned |
| Embedding dedup not implemented | MEDIUM | Feature | Planned |
| No pagination on large queries | MEDIUM | Performance | Fixable |
| Temporary debug code | MEDIUM | Code Quality | Fixable |
| Stale overwrite guard logging | MEDIUM | Reliability | Fixable |
| Mock mode scattered | MEDIUM | Code Quality | Fixable |
| Config management complexity | MEDIUM | Operations | Fixable |
| Lifecycle automation observability | MEDIUM | Observability | Fixable |
| Notes model too flat | MEDIUM | Data Model | Roadmap blocker |
| Console logging in production | LOW | Code Quality | Fixable |
| Missing input validation | LOW | Code Quality | Fixable |
| Test coverage gaps | LOW | Testing | Ongoing |
| Database indexes incomplete | LOW | Performance | Fixable |
| Dual-pipeline scraper integration | MEDIUM | Architecture | Unclear |
| Cockpit UI partially implemented | MEDIUM | Feature | In progress |
| Normalization version tracking | MEDIUM | Data Quality | Fixable |
| Record confidence not used | LOW | Data Quality | Fixable |
| No rate limiting | MEDIUM | Security | Fixable |
| Env vars not validated | MEDIUM | Operations | Fixable |
| Data model documentation | LOW | Documentation | Fixable |

---

## Recommended Action Plan

### Immediate (This Sprint)
1. Fix missing session auth in resume save endpoint (security)
2. Remove `@ts-ignore` comments and fix types
3. Remove temporary debug code from profile route
4. Add input validation to critical API routes

### Short Term (Next 2 Sprints)
1. Implement Phase 1 of roadmap: unify opportunity model
2. Resolve Application vs Workspace status conflict
3. Add pagination to all list endpoints
4. Implement embedding tier dedup

### Medium Term (Next Quarter)
1. Migrate JSON fields to proper tables
2. Consolidate resume ownership model
3. Implement stage journals for notes
4. Add comprehensive error reporting

### Long Term (Ongoing)
1. Increase test coverage to 80%+
2. Add structured logging and observability
3. Implement rate limiting and security hardening
4. Complete cockpit UI implementation
5. Document data model and architecture

---

## References

- `docs/plans/current-implementation-roadmap.md` — Product roadmap with identified risks
- `docs/decisions/002-kc-scraper-dual-pipeline.md` — Scraper architecture
- `docs/decisions/005-opportunity-lifecycle-state-contract.md` — Lifecycle model
- `JOURNAL.md` — Recent changes and rationale
- `prisma/schema.prisma` — Current data model
