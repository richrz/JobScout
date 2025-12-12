# Task 17: Job Aggregation System - Completion Plan

**Status**: 6/8 subtasks complete  
**Remaining Work**: Subtasks 17.7 and 17.8  
**Last Updated**: 2025-12-12

---

## Executive Summary

Task 17 aims to build a complete job aggregation system. **6 of 8 subtasks are complete**, with robust TypeScript scrapers, geocoding, filtering, scoring, deduplication, and scheduling already implemented and tested.

### What's Already Done ✅
- ✅ **17.1**: Job scrapers (Indeed, LinkedIn, Company pages) using Cheerio
- ✅ **17.2**: Google Maps Geocoding API with Redis caching
- ✅ **17.3**: Geographic filtering (Haversine formula)
- ✅ **17.4**: Composite scoring algorithm
- ✅ **17.5**: Deduplication using Fuse.js fuzzy matching
- ✅ **17.6**: Scheduler with cron jobs and manual trigger endpoint

### What Remains 🔨
- 🔨 **17.7**: Database Persistence Service (save scraped jobs to PostgreSQL)
- 🔨 **17.8**: UI Integration (already 90% complete, needs verification)

---

## n8n Architecture Decision

### The Situation

The PRD mentions "n8n workflows" for job aggregation, but:
- Previous implementation used **TypeScript functions** (not actual n8n workflows)
- Audit report flagged this discrepancy
- Current scrapers are **working and tested** using Cheerio for HTML parsing

### Recommended Architecture: **Hybrid Approach**

#### Option A: Pure TypeScript (RECOMMENDED)
**What it means**: No n8n at all. Use the existing TypeScript scrapers with cron jobs.

**Pros**:
- ✅ Already implemented and tested
- ✅ Simpler deployment (no n8n container needed)
- ✅ Faster execution (no HTTP overhead)
- ✅ Better debugging (TypeScript stack traces)
- ✅ Type safety and IDE support

**Cons**:
- ❌ Deviates from PRD's "n8n workflows" vision
- ❌ Less visual (no workflow diagram UI)
- ❌ Harder for non-devs to modify scraping logic

**Implementation**:
- Keep current `src/lib/job-scrapers.ts`
- Use `node-cron` or Next.js Edge Functions for scheduling
- Expose manual trigger via API route (already exists)

---

#### Option B: n8n Orchestration + TypeScript Execution
**What it means**: n8n triggers and coordinates, but delegates actual scraping to our TypeScript functions.

**Pros**:
- ✅ Visual workflow UI (easier to understand flow)
- ✅ Built-in error handling and retry logic
- ✅ Webhook triggers (manual + scheduled)
- ✅ Monitoring dashboard
- ✅ Aligns with PRD

**Cons**:
- ❌ Requires running n8n container (extra memory: ~300MB)
- ❌ Setup complexity (n8n credentials, webhook URLs)
- ❌ HTTP latency between n8n and app

**Implementation**:
1. Deploy n8n via Docker Compose (already in stack)
2. Create n8n workflows:
   - **Workflow 1**: Scheduled trigger → HTTP Request to `/api/aggregation/run`
   - **Workflow 2**: Webhook trigger (manual) → HTTP Request to same endpoint
3. Keep all scraping logic in TypeScript
4. n8n just orchestrates timing and error notifications

**n8n Workflow Example** (JSON export):
```json
{
  "name": "Job Aggregation Scheduler",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [6]
        }
      },
      "name": "Every 6 Hours",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "http://app:3000/api/admin/trigger-aggregation",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      },
      "name": "Trigger Aggregation",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json[\"statusCode\"]}}",
              "value2": 200
            }
          ]
        }
      },
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "position": [650, 300]
    }
  ]
}
```

---

#### Option C: Pure n8n (NOT RECOMMENDED)
**What it means**: Implement all scraping logic as n8n nodes.

**Why NOT**:
- ❌ No type safety
- ❌ Hard to test
- ❌ Limited HTML parsing capabilities
- ❌ Difficult to maintain complex logic
- ❌ Poor developer experience

---

### **My Recommendation: Option A** (Pure TypeScript)

**Rationale**:
1. **Already works**: Current implementation passes all tests
2. **Simpler deployment**: One less service to manage
3. **Better DX**: TypeScript is easier to debug and maintain
4. **Performance**: No HTTP round-trips
5. **PRD Flexibility**: The PRD says "n8n **or** cron jobs" (line 218)

**How to align with PRD**:
- Update PRD to reflect "TypeScript scrapers with cron scheduling"
- Keep n8n as an **optional enhancement** for users who want visual workflows
- Document both approaches in README

**If you prefer n8n**, we'd implement **Option B** (hybrid), keeping our TypeScript logic but adding n8n orchestration layer.

---

## Remaining Subtasks: Implementation Plan

### Subtask 17.7: Database Persistence Service

**Goal**: Save scraped jobs to PostgreSQL using Prisma.

**Current State**:
- Prisma `Job` model exists and is correct
- Scrapers return `JobListing[]` interface
- No database writes happen yet

**Implementation Steps**:

#### Step 1: Create Job Service
**File**: `src/lib/job-service.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { JobListing } from './job-scrapers';
import { geocodeLocation } from './geocoding';

export async function saveJobs(jobs: JobListing[]): Promise<void> {
  for (const job of jobs) {
    // Geocode location
    const coords = await geocodeLocation(job.location).catch(() => null);

    // Upsert job (update if sourceUrl exists, insert if new)
    await prisma.job.upsert({
      where: { sourceUrl: job.sourceUrl },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        latitude: coords?.lat,
        longitude: coords?.lng,
        description: job.description,
        salary: job.salary,
        postedAt: job.postedAt || new Date(),
        // Scores will be calculated later
      },
      create: {
        title: job.title,
        company: job.company,
        location: job.location,
        latitude: coords?.lat,
        longitude: coords?.lng,
        description: job.description,
        salary: job.salary,
        postedAt: job.postedAt || new Date(),
        source: job.source,
        sourceUrl: job.sourceUrl,
      },
    });
  }
}
```

#### Step 2: Update Schema (Add Unique Constraint)
**File**: `prisma/schema.prisma`

```prisma
model Job {
  // ... existing fields
  sourceUrl       String   @unique  // Add @unique to prevent duplicates
  // ... rest of model
}
```

#### Step 3: Integrate into Aggregation Pipeline
**File**: `src/lib/job-scrapers.ts` (update `runAggregation()`)

```typescript
export async function runAggregation(): Promise<void> {
  console.log('Starting job aggregation run...');
  const startTime = Date.now();

  try {
    const [indeedJobs, linkedInJobs] = await Promise.all([
      fetchIndeedJobs().catch(err => {
        console.error('Error fetching Indeed jobs:', err);
        return [];
      }),
      fetchLinkedInJobs().catch(err => {
        console.error('Error fetching LinkedIn jobs:', err);
        return [];
      })
    ]);

    const allJobs = [...indeedJobs, ...linkedInJobs];
    
    // NEW: Save to database
    await saveJobs(allJobs);

    const totalJobs = allJobs.length;
    const duration = Date.now() - startTime;

    console.log(`Aggregation completed in ${duration}ms. Saved ${totalJobs} jobs.`);

  } catch (error) {
    console.error('Critical error during aggregation:', error);
    throw error;
  }
}
```

#### Step 4: Write Tests
**File**: `tests/unit/job-service.test.ts`

```typescript
import { saveJobs } from '@/lib/job-service';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/geocoding', () => ({
  geocodeLocation: jest.fn().mockResolvedValue({ lat: 40.7128, lng: -74.0060 }),
}));

describe('saveJobs', () => {
  it('should save jobs to database', async () => {
    const mockJobs = [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        description: 'Great job',
        source: 'indeed' as const,
        sourceUrl: 'https://indeed.com/job/123',
        scrapedAt: new Date(),
      },
    ];

    await saveJobs(mockJobs);

    expect(prisma.job.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceUrl: 'https://indeed.com/job/123' },
      })
    );
  });
});
```

**Test Strategy**:
- Run aggregation pipeline with test data
- Verify database inserts using Prisma queries
- Test upsert logic (same job scraped twice shouldn't duplicate)
- Verify geocoding integration

---

### Subtask 17.8: Connect /jobs UI to Real Database

**Goal**: Verify `/jobs` page displays live database data.

**Current State**:
- ✅ `/jobs/page.tsx` already uses `prisma.job.findMany()`
- ✅ UI renders job cards correctly
- ⚠️ Database might be empty (no scraped jobs yet)

**Implementation Steps**:

#### Step 1: Seed Database with Test Data
**File**: `prisma/seed-jobs.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.job.createMany({
    data: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        description: 'Build awesome things',
        salary: '$150k - $200k',
        postedAt: new Date(),
        source: 'indeed',
        sourceUrl: 'https://indeed.com/job/1',
        compositeScore: 0.92,
      },
      // Add 5-10 more sample jobs
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run**: `npx ts-node prisma/seed-jobs.ts`

#### Step 2: Verify UI Display
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/jobs`
3. Confirm:
   - ✅ Jobs are displayed
   - ✅ Company names, titles, locations render correctly
   - ✅ Composite scores show as percentage
   - ✅ "View Details" links work

#### Step 3: Add Filters (Optional Enhancement)
**File**: `src/app/jobs/page.tsx` (update)

```typescript
export default async function JobsPage({
  searchParams,
}: {
  searchParams: { source?: string };
}) {
  const whereClause = searchParams.source
    ? { source: searchParams.source }
    : {};

  const jobs = await prisma.job.findMany({
    where: whereClause,
    orderBy: { compositeScore: 'desc' },
    take: 50,
  });

  return (
    // ... existing UI with working filters
  );
}
```

#### Step 4: E2E Test
**File**: `tests/e2e/jobs-page.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test('jobs page displays database jobs', async ({ page }) => {
  await page.goto('/jobs');
  
  // Wait for jobs to load
  await page.waitForSelector('[data-testid="job-card"]');
  
  // Verify at least one job is displayed
  const jobCards = await page.locator('[data-testid="job-card"]').count();
  expect(jobCards).toBeGreaterThan(0);
  
  // Verify job card contains expected elements
  const firstCard = page.locator('[data-testid="job-card"]').first();
  await expect(firstCard.locator('h3')).toBeVisible(); // Title
  await expect(firstCard.locator('p')).toContainText(/./); // Company
});
```

---

## TDD Workflow for Remaining Subtasks

### Subtask 17.7: Database Persistence

**RED Phase**:
1. Write test: `tests/unit/job-service.test.ts`
2. Test should fail (no `saveJobs()` function exists)
3. Run: `npm test -- job-service.test.ts`

**GREEN Phase**:
1. Create `src/lib/job-service.ts`
2. Implement `saveJobs()` function
3. Update Prisma schema (add `@unique` to `sourceUrl`)
4. Run migration: `npx prisma migrate dev --name add-unique-source-url`
5. Run test: `npm test -- job-service.test.ts` → ✅ PASS

**COMMIT**:
```bash
git add .
git commit -m "feat(task-17.7): implement database persistence service for aggregated jobs"
```

**Update Task Master**:
```bash
npx task-master update-subtask --id=17.7 --prompt="Implemented job-service.ts with upsert logic. Added unique constraint to sourceUrl. All tests passing."
npx task-master set-status --id=17.7 --status=done
```

---

### Subtask 17.8: UI Verification

**RED Phase**:
1. Write E2E test: `tests/e2e/jobs-page.test.ts`
2. Test should fail if database is empty
3. Run: `npx playwright test jobs-page`

**GREEN Phase**:
1. Seed database: `npx ts-node prisma/seed-jobs.ts`
2. Verify `/jobs` page in browser
3. Run E2E test: `npx playwright test jobs-page` → ✅ PASS

**COMMIT**:
```bash
git add .
git commit -m "feat(task-17.8): verify /jobs UI displays real database jobs"
```

**Update Task Master**:
```bash
npx task-master update-subtask --id=17.8 --prompt="Seeded database with test jobs. Verified UI displays correctly. E2E test passing."
npx task-master set-status --id=17.8 --status=done
npx task-master set-status --id=17 --status=review
```

---

## Deployment Considerations

### If Using Pure TypeScript (Option A)
1. No changes to `docker-compose.yml` needed
2. Scheduler runs via cron job in app container
3. Manual trigger: `curl http://localhost:3000/api/admin/trigger-aggregation`

### If Using n8n (Option B)
1. Ensure n8n service is running: `docker-compose up -d n8n`
2. Access n8n UI: `http://localhost:5678`
3. Import workflow JSON (create `n8n-workflows/job-aggregation.json`)
4. Configure credentials (API header auth with secret key)
5. Activate workflow

---

## Final Checklist

Before marking Task 17 complete:

- [ ] **17.7**: Database persistence service implemented
- [ ] **17.7**: Unique constraint added to `sourceUrl`
- [ ] **17.7**: Unit tests passing
- [ ] **17.7**: Integration test with real DB (dev environment)
- [ ] **17.8**: Seed data created
- [ ] **17.8**: `/jobs` page verified in browser
- [ ] **17.8**: E2E test passing
- [ ] **n8n Decision**: Documented in PRD or architecture docs
- [ ] **Manual Test**: Run full aggregation pipeline end-to-end
- [ ] **Git Clean**: All changes committed
- [ ] **Task Master**: Subtasks 17.7 and 17.8 marked `done`
- [ ] **Audit Ready**: Task 17 set to `review` status

---

## Questions for User

1. **n8n Decision**: Do you want **Option A** (pure TypeScript, simpler) or **Option B** (n8n orchestration, aligns with PRD)?

2. **Geocoding**: Should we geocode ALL jobs during scraping, or only when displaying on map? (Geocoding costs ~$5/1000 requests if using Google Maps API)

3. **Scheduling Frequency**: PRD says "every 6 hours". Confirm this is still desired, or change to hourly/daily?

4. **Database Seeding**: Should I create realistic seed data (50-100 jobs) or minimal test data (5-10 jobs)?

5. **PRD Update**: If we go with Option A (TypeScript), do you want me to update the PRD to reflect this, or keep "n8n or cron jobs" as-is?

---

## Estimated Time to Completion

- **Subtask 17.7**: 45-60 minutes (service + tests)
- **Subtask 17.8**: 15-30 minutes (verification + E2E test)
- **n8n Setup** (if Option B): +30 minutes
- **Total**: ~1.5-2 hours

**Ready to proceed once you answer the n8n architecture question!**
