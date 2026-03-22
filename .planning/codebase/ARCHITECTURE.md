# JobScout Architecture

**Last Updated:** 2026-03-22
**Codebase Root:** `/home/richard/code/jobs/job-search-platform`

## Overview

JobScout is a Next.js 16 SaaS platform for AI-powered job search and application management. It combines job ingestion (dual-pipeline scraper + Cloud Talent Solution), resume generation/customization, and a workspace-based CRM for tracking opportunities through their lifecycle.

**Tech Stack:**
- Frontend: React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS, Radix UI
- Backend: Next.js API routes, Node.js
- Database: PostgreSQL (Prisma ORM), Redis (caching), Qdrant (vector search)
- LLM: Multi-provider support (OpenAI, Anthropic, Google Generative AI) via LangChain
- Auth: NextAuth.js 4 (JWT + Prisma adapter)
- External APIs: Google Cloud Talent Solution, Google Maps, N8N (scraper orchestration)

---

## Architectural Patterns

### 1. **Layered Architecture**

```
┌─────────────────────────────────────────┐
│  Pages & Client Components (React)      │
│  /src/app/[route]/page.tsx              │
│  /src/components/[feature]/             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Server Actions & API Routes            │
│  /src/app/api/[endpoint]/route.ts       │
│  /src/app/[route]/actions.ts            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Business Logic & Services              │
│  /src/lib/[service].ts                  │
│  - job-service.ts (persistence)         │
│  - llm.ts (LLM orchestration)           │
│  - resume-generator.ts (generation)     │
│  - profile-import-service.ts (parsing)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Data Access & External Integrations    │
│  - Prisma (PostgreSQL)                  │
│  - Redis (cache)                        │
│  - Qdrant (vectors)                     │
│  - CTS (Cloud Talent Solution)          │
│  - LangChain (LLM providers)            │
└─────────────────────────────────────────┘
```

### 2. **Data Flow Patterns**

#### Job Ingestion Pipeline
```
N8N Scraper / API Source
    ↓
/api/jobs (POST)
    ↓
normalizeJobData() [ingest/normalization.ts]
    ↓
upsertJobRecord() [job-service.ts]
    ├─ Path 1: sourceUrl exists → refresh
    ├─ Path 2: fingerprint match → cross-source dedup
    └─ Path 3: new → insert
    ↓
Postgres (source of truth)
    ↓
pushToCts() [async, best-effort]
    ↓
Cloud Talent Solution (search index)
```

#### Resume Generation Flow
```
User selects job + profile
    ↓
/api/resume/generate (POST)
    ↓
ResumeGenerator.generate()
    ├─ buildResumeWriterZeroPrompt()
    ├─ getLLMClient() → provider-specific client
    └─ generateResponse() → LLM call
    ↓
stripMarkdownCodeBlocks() + JSON parsing
    ↓
Resume document (JSON structure)
    ↓
/api/resume/export/docx (POST)
    ↓
docx library → DOCX file
```

#### Workspace Lifecycle
```
Job discovered
    ↓
User creates workspace (job + profile)
    ↓
Workspace status: INTERESTED → APPLIED → FOLLOW_UP → DORMANT → ARCHIVED
    ↓
Artifacts (resumes, cover letters) stored per workspace
    ↓
War room notes for tracking
    ↓
Analytics aggregated from workspace states
```

### 3. **Authentication & Authorization**

- **Strategy:** JWT-based sessions via NextAuth.js
- **Providers:** Google OAuth, Credentials (dev/prod)
- **Session Storage:** JWT token in secure HTTP-only cookie
- **Dev Bypass:** `dev@localhost / devpass123` in non-production
- **User Context:** Available via `getServerSession(authOptions)` in server components/actions

### 4. **Deduplication Strategy**

Three-tier dedup without Prisma upsert fallthrough:

1. **sourceUrl match** → Update existing record (refresh content)
2. **fingerprint match** → Cross-source dedup (update canonical, mark as deduped)
3. **Neither** → Insert new record

Fingerprint = SHA256(normalize(company + title + canonical_location))

DB trigger `job_stale_overwrite_guard` rejects UPDATEs where incoming `lastExtractedAt` is older than stored value.

### 5. **LLM Provider Abstraction**

```typescript
interface LLMClient {
  generateResponse(messages: LLMMessage[]): Promise<LLMResponse>
  generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>>
  testConnection(): Promise<LLMConnectionTest>
  getProvider(): LLMProvider
  getModel(): string
}

// Implementations:
// - OpenAI (ChatOpenAI via LangChain)
// - Anthropic (ChatAnthropic via LangChain)
// - Google Generative AI (ChatGoogleGenerativeAI via LangChain)
```

Config stored in `Config.llmConfig` (JSON), validated at runtime.

### 6. **Caching Strategy**

- **Redis:** Session cache, rate limiting, temporary job data
- **In-Memory:** Component-level React Query (if used)
- **DB Indexes:** Optimized for common queries (postedAt, status, location, skills)

### 7. **Error Handling**

- **API Routes:** Try-catch with structured error responses (status, message, code)
- **Server Actions:** Error boundaries in client components
- **LLM Calls:** Retry logic with exponential backoff (429, 5xx)
- **DB Operations:** Prisma error handling, stale-overwrite guard at DB level

---

## Core Services

### Job Service (`src/lib/job-service.ts`)
- **Responsibility:** Dual-write to Postgres + CTS
- **Key Functions:**
  - `saveJobs(jobs)` → normalize, upsert, push to CTS
  - `upsertJobRecord(jobData)` → three-path upsert logic
  - `pushToCts(job)` → async CTS sync

### LLM Service (`src/lib/llm.ts`)
- **Responsibility:** Multi-provider LLM orchestration
- **Key Functions:**
  - `getLLMClient(config)` → instantiate provider-specific client
  - `generateResponse(messages)` → call LLM with retry
  - `testConnection()` → validate provider credentials

### Resume Generator (`src/lib/resume-generator.ts`)
- **Responsibility:** AI-powered resume customization
- **Key Functions:**
  - `ResumeGenerator.generate(request)` → LLM-based generation
  - `stripMarkdownCodeBlocks()` → clean LLM output
  - `balanceJsonDelimiters()` → repair malformed JSON

### Profile Import Service (`src/lib/profile-import-service.ts`)
- **Responsibility:** Parse resumes (PDF, DOCX, TXT) into structured profile
- **Key Functions:**
  - `importResume(file)` → detect format, parse, extract
  - `normalizeProfileData()` → standardize fields

### Ingestion Pipeline (`src/lib/ingest/`)
- **normalization.ts:** Normalize job data (salary, location, skills, seniority)
- **ats-classifier.ts:** Classify job posting as ATS-compatible
- **dedup-worker.ts:** Cross-source deduplication logic
- **html-to-markdown.ts:** Convert job descriptions to markdown

---

## Data Models

### Core Entities (Prisma Schema)

**User**
- id, email, name, image, password (hashed)
- Relations: profile, applications, workspaces, resumes, config

**Job**
- id, title, company, location, latitude, longitude, description, salary
- sourceUrl (unique), source, postedAt, createdAt
- **P0 Fields:** sourceType, canonicalUrl, fingerprint (unique), lastExtractedAt, recordConfidence, normalizationVersion
- **P0 Structured:** salaryMin, salaryMax, salaryCurrency, workMode, seniority, skillsTags
- **P1 Fields:** companyId (FK to Company), observedListings (cross-source tracking)
- Relations: applications, workspaces, resumes

**Workspace** (CRM entity per job per user)
- id, userId, jobId, applicationId, status (INTERESTED|APPLIED|FOLLOW_UP|DORMANT|ARCHIVED), priority
- Relations: artifacts, notes, resumes

**Artifact** (Resume, cover letter, etc.)
- id, workspaceId, type, name, storagePath, content

**WarRoomNote** (Workspace notes)
- id, workspaceId, content, createdAt, updatedAt

**Profile** (User's master profile)
- id, userId, contactInfo, experiences, education, skills, projects, certifications, preferences, completeness

**Config** (User settings)
- id, userId, searchParams, llmConfig, dailyCaps, fileNaming

**Resume** (Document state tracking)
- id, userId, jobId, workspaceId, documentState (REFERENCE|WORKING_DRAFT|SAVED_VARIANT|SUBMITTED_SNAPSHOT)
- content, exportedAt, createdAt, updatedAt

---

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` → NextAuth.js handler
- `POST /api/auth/dev-login` → Dev-only bypass
- `POST /api/auth/single-user` → Single-user mode

### Jobs & Search
- `GET /api/jobs` → Fetch jobs (filters, pagination)
- `POST /api/jobs` → Ingest jobs from scraper

### Resume
- `POST /api/resume/generate` → Generate customized resume
- `POST /api/resume/analyze` → ATS compatibility scoring
- `POST /api/resume/save` → Save resume variant
- `POST /api/resume/export/docx` → Export to DOCX

### Profile
- `GET /api/profile` → Fetch user profile
- `POST /api/profile` → Update profile
- `POST /api/profile/import-resume` → Parse resume file

### Workspace (CRM)
- `GET /api/workspace` → List workspaces
- `POST /api/workspace` → Create workspace
- `GET /api/workspace/[id]` → Get workspace details
- `POST /api/workspace/[id]/notes` → Add note
- `POST /api/workspace/[id]/artifacts/[artifactId]` → Manage artifacts
- `POST /api/workspace/apply` → Mark as applied

### Triage (Job discovery)
- `GET /api/triage/feed` → Get job feed for triage
- `POST /api/triage/action` → Accept/reject job
- `POST /api/triage/batch-action` → Bulk actions

### Analytics
- `GET /api/analytics/dashboard` → Dashboard metrics

### Admin
- `GET /api/admin/cts-status` → CTS sync status
- `POST /api/admin/trigger-aggregation` → Manual aggregation

### Config
- `GET /api/config` → User configuration
- `POST /api/config` → Update configuration

---

## Entry Points

### Web Application
- **Root:** `/src/app/layout.tsx` → RootLayout with providers
- **Home:** `/src/app/page.tsx` → Redirects to dashboard or signin
- **Dashboard:** `/src/app/dashboard-wireframe/page.tsx` → Main UI
- **Jobs:** `/src/app/jobs/page.tsx` → Job listing
- **Pipeline:** `/src/app/pipeline/page.tsx` → Drag-drop pipeline
- **Triage:** `/src/app/triage/page.tsx` → Job discovery feed
- **Resume:** `/src/app/resume/page.tsx` → Resume builder
- **Workspace:** `/src/app/workspace/[id]/page.tsx` → Job workspace (CRM)
- **Settings:** `/src/app/settings/page.tsx` → User configuration
- **Auth:** `/src/app/auth/signin/page.tsx` → Sign-in page

### Providers & Context
- **AuthSessionProvider** → NextAuth session context
- **ThemeProvider** → Dark/light mode
- **ConfigProvider** → User config context
- **AppShell** → Layout wrapper (sidebar, nav)

---

## Key Abstractions

### Normalization Contract
Jobs normalized to consistent schema:
- Salary: min/max/currency (extracted from text)
- Location: geocoded to lat/lon
- Seniority: entry|mid|senior|staff_plus|unknown
- Work Mode: remote|hybrid|onsite|unknown
- Skills: extracted tags array

### Fingerprinting
SHA256(normalize(company + title + canonical_location)) for cross-source dedup.

### Document State Machine
```
REFERENCE (master)
    ↓
WORKING_DRAFT (editing)
    ↓
SAVED_VARIANT (checkpoint)
    ↓
SUBMITTED_SNAPSHOT (locked)
```

### Workspace Status Lifecycle
```
INTERESTED → APPLIED → FOLLOW_UP → DORMANT → ARCHIVED
```

---

## Performance Considerations

1. **DB Indexes:** Optimized for common queries (postedAt, status, location, skills, sourceType)
2. **Pagination:** API endpoints support limit/offset
3. **Caching:** Redis for session, rate limiting
4. **Async Operations:** CTS push is fire-and-forget
5. **Stale-Overwrite Guard:** DB trigger prevents race conditions in distributed scraper
6. **Vector Search:** Qdrant for semantic job matching (future)

---

## Security

- **Auth:** JWT-based, HTTP-only cookies
- **CSRF:** Middleware protection (if enabled)
- **Rate Limiting:** Redis-backed rate limiter
- **Input Validation:** Zod schemas for API inputs
- **Password Hashing:** bcryptjs for user passwords
- **Environment Variables:** Loaded from .env, validated at startup

---

## Testing

- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright (smoke tests available)
- **Mock Mode:** `NEXT_PUBLIC_MOCK_MODE=true` for offline development

---

## Deployment

- **Build:** `next build` → static + server bundles
- **Start:** `next start` or custom `scripts/start.sh`
- **Docker:** Dockerfile + docker-compose.yml for local dev
- **Environment:** .env.local for secrets, .env for defaults

---

## Known Limitations & TODOs

1. **CTS Integration:** Best-effort async push; Postgres is source of truth
2. **Vector Search:** Qdrant integration in progress (P1)
3. **Company Entity Resolution:** P1 feature (companyId FK nullable)
4. **Resume Streaming:** Partial support; full streaming in progress
5. **Workspace Artifacts:** Storage path abstraction (local vs cloud TBD)
