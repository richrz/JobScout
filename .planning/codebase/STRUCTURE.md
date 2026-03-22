# JobScout Directory Structure

**Last Updated:** 2026-03-22
**Codebase Root:** `/home/richard/code/jobs/job-search-platform`

## High-Level Overview

```
job-search-platform/
├── src/                          # Application source code
│   ├── app/                      # Next.js App Router (pages + API routes)
│   ├── components/               # React components (UI, layout, features)
│   ├── lib/                      # Business logic, services, utilities
│   ├── types/                    # TypeScript type definitions
│   ├── contexts/                 # React context providers
│   ├── hooks/                    # Custom React hooks
│   └── scripts/                  # Utility scripts
├── prisma/                       # Database schema & migrations
├── public/                       # Static assets
├── e2e/                          # End-to-end tests (Playwright)
├── docs/                         # Project documentation (external)
├── .env.local                    # Local environment variables
├── package.json                  # Dependencies & scripts
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── jest.config.js                # Jest test configuration
```

---

## `/src/app` — Next.js App Router

### Structure
```
src/app/
├── layout.tsx                    # Root layout (providers, fonts, metadata)
├── page.tsx                      # Home page (redirects to dashboard or signin)
├── globals.css                   # Global styles
│
├── auth/                         # Authentication pages
│   └── signin/
│       └── page.tsx              # Sign-in page
│
├── api/                          # API routes (server-side handlers)
│   ├── auth/
│   │   ├── [...nextauth]/route.ts    # NextAuth.js handler
│   │   ├── dev-login/route.ts        # Dev-only login bypass
│   │   └── single-user/route.ts      # Single-user mode
│   │
│   ├── jobs/
│   │   └── route.ts              # GET/POST jobs (fetch, ingest)
│   │
│   ├── resume/
│   │   ├── generate/route.ts      # POST generate customized resume
│   │   ├── analyze/route.ts       # POST ATS compatibility scoring
│   │   ├── save/route.ts          # POST save resume variant
│   │   └── export/
│   │       └── docx/route.ts      # POST export to DOCX
│   │
│   ├── profile/
│   │   ├── route.ts              # GET/POST user profile
│   │   └── import-resume/route.ts # POST parse resume file
│   │
│   ├── workspace/
│   │   ├── route.ts              # GET/POST workspaces (list, create)
│   │   ├── apply/route.ts        # POST mark as applied
│   │   └── [id]/
│   │       ├── route.ts          # GET workspace details
│   │       ├── notes/
│   │       │   ├── route.ts      # GET/POST notes
│   │       │   └── [noteId]/route.ts  # DELETE note
│   │       └── artifacts/
│   │           └── [artifactId]/route.ts  # GET/DELETE artifact
│   │
│   ├── triage/
│   │   ├── feed/route.ts         # GET job feed for triage
│   │   ├── action/route.ts       # POST accept/reject job
│   │   └── batch-action/route.ts # POST bulk actions
│   │
│   ├── analytics/
│   │   └── dashboard/route.ts    # GET dashboard metrics
│   │
│   ├── admin/
│   │   ├── cts-status/route.ts   # GET CTS sync status
│   │   └── trigger-aggregation/route.ts  # POST manual aggregation
│   │
│   ├── config/route.ts           # GET/POST user configuration
│   ├── session/route.ts          # GET current session
│   ├── secure/route.ts           # Secure endpoint (auth required)
│   ├── cockpit/
│   │   └── pipeline/route.ts     # GET cockpit pipeline data
│   ├── llm/
│   │   ├── test/route.ts         # POST test LLM call
│   │   └── test-connection/route.ts  # POST test provider connection
│   ├── ai/
│   │   └── suggest-skills/route.ts   # POST AI skill suggestions
│   ├── passed/
│   │   └── action/route.ts       # POST mark job as passed
│   ├── pipeline/
│   │   └── add/route.ts          # POST add job to pipeline
│   ├── cron/
│   │   └── lifecycle/route.ts    # POST cron job lifecycle management
│   └── simulation/route.ts       # POST simulation endpoint
│
├── dashboard-wireframe/
│   └── page.tsx                  # Main dashboard (wireframe)
│
├── dashboard-v2/
│   └── page.tsx                  # Dashboard v2 (alternative)
│
├── dashboard-cockpit-prototype/
│   ├── page.tsx                  # Cockpit prototype page
│   └── CockpitPrototypeClient.tsx # Cockpit client component
│
├── jobs/
│   ├── page.tsx                  # Job listing page
│   └── [id]/
│       └── page.tsx              # Job detail page
│
├── pipeline/
│   └── page.tsx                  # Drag-drop pipeline page
│
├── triage/
│   └── page.tsx                  # Job discovery/triage page
│
├── passed/
│   └── page.tsx                  # Passed jobs page
│
├── resume/
│   ├── page.tsx                  # Resume builder page
│   ├── actions.ts                # Server actions for resume
│   └── ResumeBuilder.tsx          # Resume builder component
│
├── workspace/
│   └── [id]/
│       └── page.tsx              # Workspace (job CRM) page
│
├── profile/
│   └── page.tsx                  # User profile page
│
├── settings/
│   └── page.tsx                  # Settings page
│
├── map/
│   └── page.tsx                  # Job map page
│
├── career/
│   └── page.tsx                  # Career page
│
├── onboarding/
│   └── page.tsx                  # Onboarding flow
│
├── design-system/
│   └── page.tsx                  # Design system showcase
│
├── cockpit-drawer-wireframe/
│   └── page.tsx                  # Cockpit drawer wireframe
│
├── dashboard-wireframe/
│   └── CockpitWireframeClient.tsx # Wireframe client component
│
└── actions/
    └── application.ts            # Server actions for applications
```

### Naming Conventions
- **Pages:** `page.tsx` (Next.js convention)
- **API Routes:** `route.ts` (Next.js convention)
- **Server Actions:** `actions.ts` (co-located with feature)
- **Dynamic Routes:** `[param]` or `[...catch-all]` (Next.js convention)

---

## `/src/components` — React Components

### Structure
```
src/components/
├── layout/                       # Layout components
│   ├── AppShell.tsx              # Main app wrapper
│   ├── AppLayout.tsx             # App layout container
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── MobileNav.tsx             # Mobile navigation
│   ├── PillNav.tsx               # Pill-style navigation
│   ├── UserMenu.tsx              # User dropdown menu
│   ├── Page.tsx                  # Page wrapper
│   ├── Section.tsx               # Section wrapper
│   └── ShellCard.tsx             # Card component
│
├── ui/                           # Primitive UI components (Radix UI + Tailwind)
│   ├── button.tsx                # Button component
│   ├── input.tsx                 # Input field
│   ├── textarea.tsx              # Textarea field
│   ├── label.tsx                 # Label component
│   ├── card.tsx                  # Card container
│   ├── checkbox.tsx              # Checkbox input
│   ├── separator.tsx             # Divider
│   ├── popover.tsx               # Popover menu
│   ├── tooltip.tsx               # Tooltip
│   ├── sheet.tsx                 # Drawer/sheet
│   ├── collapsible.tsx           # Collapsible section
│   ├── ProgressBar.tsx           # Progress bar
│   ├── SwipeableCard.tsx         # Swipeable card (mobile)
│   ├── RichTextEditor.tsx        # Rich text editor
│   └── empty-state.tsx           # Empty state placeholder
│
├── dashboard/                    # Dashboard components
│   ├── DashboardMetrics.tsx      # Metrics display
│   └── PowerCharts.tsx           # Chart components
│
├── charts/                       # Chart components (Recharts)
│   └── [chart-types].tsx         # Various chart types
│
├── jobs/                         # Job-related components
│   ├── JobCard.tsx               # Job card display
│   ├── JobList.tsx               # Job list container
│   ├── JobFilters.tsx            # Filter controls
│   └── [other-job-components].tsx
│
├── pipeline/                     # Pipeline components
│   ├── PipelineBoard.tsx         # Kanban board
│   ├── PipelineCard.tsx          # Pipeline card
│   └── [other-pipeline-components].tsx
│
├── triage/                       # Triage components
│   ├── TriageCard.tsx            # Triage job card
│   ├── TriageFeed.tsx            # Triage feed
│   └── [other-triage-components].tsx
│
├── resume/                       # Resume components
│   ├── ResumePreview.tsx         # Resume preview
│   ├── ResumeEditor.tsx          # Resume editor
│   ├── ResumeSections.tsx        # Resume sections
│   └── [other-resume-components].tsx
│
├── workspace/                    # Workspace (CRM) components
│   ├── WorkspaceHeader.tsx       # Workspace header
│   ├── WorkspaceNotes.tsx        # Notes section
│   ├── WorkspaceArtifacts.tsx    # Artifacts section
│   └── [other-workspace-components].tsx
│
├── profile/                      # Profile components
│   ├── ProfileForm.tsx           # Profile editor
│   ├── ExperienceForm.tsx        # Experience editor
│   └── [other-profile-components].tsx
│
├── settings/                     # Settings components
│   ├── SettingsTabs.tsx          # Settings tabs
│   ├── LLMConfig.tsx             # LLM configuration
│   ├── SearchParams.tsx          # Search parameters
│   └── [other-settings-components].tsx
│
├── map/                          # Map components
│   ├── JobMap.tsx                # Google Map display
│   ├── MapSidebar.tsx            # Map sidebar
│   ├── MapControls.tsx           # Map controls
│   └── [other-map-components].tsx
│
├── auth/                         # Auth components
│   ├── LoginForm.tsx             # Login form
│   ├── SignupForm.tsx            # Signup form
│   └── auth-status.tsx           # Auth status display
│
├── onboarding/                   # Onboarding components
│   └── [onboarding-steps].tsx
│
├── providers/                    # Context providers
│   ├── session-provider.tsx      # NextAuth session provider
│   └── [other-providers].tsx
│
├── theme-provider.tsx            # Theme provider (dark/light)
├── theme-toggle.tsx              # Theme toggle button
├── single-user-mode.tsx          # Single-user mode indicator
└── session-manager.tsx           # Session management component
```

### Naming Conventions
- **Components:** PascalCase (e.g., `JobCard.tsx`)
- **Utilities:** camelCase (e.g., `useJobFilter.ts`)
- **Exports:** Named exports for components, default for pages

---

## `/src/lib` — Business Logic & Services

### Structure
```
src/lib/
├── auth.ts                       # NextAuth configuration & auth logic
├── auth-utils.ts                 # Auth utility functions
├── client-auth.ts                # Client-side auth helpers
├── prisma.ts                     # Prisma client singleton
├── cache.ts                      # Caching utilities (Redis)
├── csrf.ts                       # CSRF protection
├── rate-limit.ts                 # Rate limiting
├── session-manager.ts            # Session management
├── env.ts                        # Environment variable validation
├── load-root-env.ts              # Load root .env file
│
├── job-service.ts                # Job persistence & CTS sync
├── job-scrapers.ts               # Job scraper implementations
├── scoring.ts                    # Job scoring logic
├── deduplication.ts              # Deduplication utilities
│
├── llm.ts                        # LLM orchestration (multi-provider)
├── llm-testing.ts                # LLM testing utilities
├── zai-config.ts                 # ZAI configuration
│
├── resume-generator.ts           # Resume generation (LLM-based)
├── resume-export.ts              # Resume export (DOCX, PDF)
├── resume-parser.ts              # Resume parsing
├── resume-document.ts            # Resume document structure
├── resume/
│   ├── resume-writer-zero.ts     # Resume writing prompt
│   └── [other-resume-utils].ts
│
├── profile-import-service.ts     # Resume import & parsing
├── profile-import.ts             # Profile import logic
├── profile-utils.ts              # Profile utilities
│
├── ingest/                       # Job ingestion pipeline
│   ├── normalization.ts          # Job data normalization
│   ├── ats-classifier.ts         # ATS compatibility classification
│   ├── dedup-worker.ts           # Deduplication worker
│   └── html-to-markdown.ts       # HTML to markdown conversion
│
├── cts/                          # Cloud Talent Solution integration
│   ├── talent-service.ts         # CTS API wrapper
│   └── [other-cts-utils].ts
│
├── workspace/                    # Workspace (CRM) utilities
│   └── [workspace-utils].ts
│
├── opportunities/                # Opportunity utilities
│   └── [opportunity-utils].ts
│
├── simulation/                   # Simulation & testing
│   └── [simulation-utils].ts
│
├── ats/                          # ATS scoring & validation
│   ├── ats-validator.ts          # ATS validation logic
│   └── [other-ats-utils].ts
│
├── validations/                  # Zod schemas & validation
│   ├── job.ts                    # Job validation schema
│   ├── profile.ts                # Profile validation schema
│   ├── resume.ts                 # Resume validation schema
│   └── [other-schemas].ts
│
├── geocoding.ts                  # Geocoding utilities
├── geographic-filter.ts          # Geographic filtering
├── file-naming.ts                # File naming utilities
├── error-reporting.ts            # Error reporting
├── scheduler.ts                  # Job scheduling
├── mem0.ts                       # Mem0 integration (if used)
├── utils.ts                      # General utilities
└── proxy.ts                      # Proxy utilities
```

### Key Service Files

**auth.ts**
- NextAuth configuration
- Provider setup (Google, Credentials)
- JWT callbacks
- Session strategy

**job-service.ts**
- `saveJobs(jobs)` → normalize, upsert, push to CTS
- `upsertJobRecord(jobData)` → three-path upsert
- `pushToCts(job)` → async CTS sync

**llm.ts**
- `BaseLLMClient` abstract class
- Provider implementations (OpenAI, Anthropic, Google)
- `getLLMClient(config)` factory
- Retry logic, streaming support

**resume-generator.ts**
- `ResumeGenerator` class
- `generate(request)` → LLM-based generation
- JSON parsing & cleanup
- Export to DOCX

**profile-import-service.ts**
- `importResume(file)` → detect format, parse
- Support for PDF, DOCX, TXT
- Extract structured profile data

**ingest/normalization.ts**
- `normalizeJobData(job)` → standardize fields
- Salary extraction & parsing
- Location geocoding
- Seniority & work mode classification
- Skills extraction

---

## `/src/types` — TypeScript Definitions

### Structure
```
src/types/
├── llm.ts                        # LLM types (providers, config, messages)
├── next-auth.d.ts               # NextAuth type augmentation
└── cosine-similarity.d.ts        # Cosine similarity type definitions
```

### Key Types

**llm.ts**
- `LLMProvider` enum (openai, anthropic, google)
- `LLMConfig` interface (provider, model, apiKey, temperature, etc.)
- `LLMMessage` interface (role, content)
- `LLMResponse` interface (content, usage, model)
- `ResumeGenerationRequest` interface

---

## `/src/contexts` — React Context Providers

### Structure
```
src/contexts/
├── ConfigContext.tsx             # User configuration context
└── [other-contexts].tsx
```

---

## `/src/hooks` — Custom React Hooks

### Structure
```
src/hooks/
├── useAuth.ts                    # Auth hook
├── useConfig.ts                  # Config hook
├── useJob.ts                     # Job hook
├── useResume.ts                  # Resume hook
└── [other-hooks].ts
```

---

## `/src/scripts` — Utility Scripts

### Structure
```
src/scripts/
├── dev.sh                        # Development startup script
├── start.sh                      # Production startup script
├── demo-task-*.ts                # Demo scripts for tasks
├── demo-chronos.ts               # Chronos demo
└── [other-scripts].ts
```

---

## `/prisma` — Database Schema & Migrations

### Structure
```
prisma/
├── schema.prisma                 # Prisma schema (data models)
├── seed.ts                       # Main seed script
├── seed-jobs.ts                  # Job seeding
├── seed-pipeline.ts              # Pipeline seeding
├── seed-map.ts                   # Map data seeding
└── migrations/
    ├── 20251204192149_init/
    │   └── migration.sql         # Initial schema
    ├── 20251212233550_add_unique_source_url/
    │   └── migration.sql         # Add sourceUrl unique constraint
    ├── 20260308230500_resume_document_truth_and_passed_bin/
    │   └── migration.sql         # Resume document & passed bin
    ├── 20260321000000_p0_job_pipeline_provenance/
    │   └── migration.sql         # P0: Pipeline provenance fields
    ├── 20260322000000_p1_company_observed_listing_dedupe/
    │   └── migration.sql         # P1: Company entity resolution
    ├── 20251220191516_init_workspace_crm/
    │   └── migration.sql         # Workspace CRM models
    └── [other-migrations]/
```

### Key Models
- User, Profile, WorkExperience, Education
- Job, Application, Workspace, Artifact, WarRoomNote
- Resume, Config, ConfigHistory
- Company, ObservedListing (P1)

---

## `/public` — Static Assets

### Structure
```
public/
├── images/                       # Image assets
├── resumes/                      # Resume storage (local)
└── [other-static-files]/
```

---

## `/e2e` — End-to-End Tests

### Structure
```
e2e/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── auth.spec.ts              # Auth flow tests
│   ├── jobs.spec.ts              # Job listing tests
│   ├── resume.spec.ts            # Resume builder tests
│   └── [other-tests].spec.ts
└── fixtures/
    └── [test-fixtures].ts
```

---

## `/docs` — Project Documentation

### Structure
```
docs/
├── README.md                     # Documentation hub
├── PRD-OPEN-SOURCE.md            # Product requirements
├── JOURNAL.md                    # Development journal
├── product/
│   ├── cockpit-interaction-spec.md
│   ├── cockpit-stage-contract.md
│   ├── lifecycle-state-contract.md
│   ├── normalization-contract.md
│   ├── workspace-lifecycle-concept.md
│   └── [other-product-specs].md
├── decisions/
│   ├── 001-llm-provider-support.md
│   ├── 002-kc-scraper-dual-pipeline.md
│   ├── 003-normalization-contract-and-provider-policy.md
│   ├── 004-opportunity-workspace-naming.md
│   ├── 005-opportunity-lifecycle-state-contract.md
│   ├── 006-recovery-buckets-and-plan-levers.md
│   ├── 007-resume-artifact-defaults-and-naming.md
│   └── README.md
├── plans/
│   ├── current-implementation-roadmap.md
│   ├── rearchitecture_and_redesign.md
│   └── [other-plans].md
├── guides/
│   ├── architect-operating-contract.md
│   ├── repo-workflow.md
│   ├── sprint-workflow.md
│   └── [other-guides].md
├── design/
│   └── design-system.md
├── audits/
│   └── [audit-reports].md
└── archive/
    └── [historical-docs]/
```

---

## Root Configuration Files

### Key Files
- **package.json** — Dependencies, scripts, metadata
- **next.config.js** — Next.js configuration
- **tsconfig.json** — TypeScript configuration
- **tailwind.config.js** — Tailwind CSS configuration
- **jest.config.js** — Jest test configuration
- **eslint.config.mjs** — ESLint configuration
- **.env.local** — Local environment variables (git-ignored)
- **.env.example** — Environment variable template
- **.gitignore** — Git ignore rules
- **docker-compose.yml** — Docker Compose for local dev
- **Dockerfile** — Docker image definition
- **nginx.conf** — Nginx configuration (if used)

---

## Naming Conventions

### Files & Directories
- **Components:** PascalCase (e.g., `JobCard.tsx`)
- **Services/Utils:** camelCase (e.g., `job-service.ts`)
- **Directories:** kebab-case (e.g., `src/lib/ingest/`)
- **API Routes:** kebab-case (e.g., `/api/resume/export/docx`)

### Code
- **React Components:** PascalCase (e.g., `function JobCard() {}`)
- **Functions:** camelCase (e.g., `function saveJobs() {}`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `const MAX_RETRIES = 3`)
- **Types/Interfaces:** PascalCase (e.g., `interface LLMConfig {}`)
- **Enums:** PascalCase (e.g., `enum ApplicationStatus {}`)

### Database
- **Tables:** PascalCase (e.g., `User`, `Job`, `Workspace`)
- **Columns:** camelCase (e.g., `sourceUrl`, `lastExtractedAt`)
- **Indexes:** descriptive (e.g., `@@index([postedAt, source])`)

---

## Key Locations Quick Reference

| Purpose | Location |
|---------|----------|
| Home page | `/src/app/page.tsx` |
| Dashboard | `/src/app/dashboard-wireframe/page.tsx` |
| Job listing | `/src/app/jobs/page.tsx` |
| Resume builder | `/src/app/resume/page.tsx` |
| Workspace (CRM) | `/src/app/workspace/[id]/page.tsx` |
| Settings | `/src/app/settings/page.tsx` |
| Auth signin | `/src/app/auth/signin/page.tsx` |
| API jobs | `/src/app/api/jobs/route.ts` |
| API resume generate | `/src/app/api/resume/generate/route.ts` |
| API workspace | `/src/app/api/workspace/route.ts` |
| Job service | `/src/lib/job-service.ts` |
| LLM service | `/src/lib/llm.ts` |
| Resume generator | `/src/lib/resume-generator.ts` |
| Auth config | `/src/lib/auth.ts` |
| Prisma schema | `/prisma/schema.prisma` |
| Database migrations | `/prisma/migrations/` |
| UI components | `/src/components/ui/` |
| Layout components | `/src/components/layout/` |
| Types | `/src/types/` |
| Contexts | `/src/contexts/` |
| Hooks | `/src/hooks/` |
| Documentation | `/docs/` |
| E2E tests | `/e2e/` |

---

## Development Workflow

### Adding a New Feature
1. Create page/component in `/src/app/[feature]/`
2. Add API route in `/src/app/api/[feature]/route.ts`
3. Add business logic in `/src/lib/[feature]-service.ts`
4. Add types in `/src/types/` if needed
5. Add UI components in `/src/components/[feature]/`
6. Add tests in `/e2e/tests/[feature].spec.ts`
7. Update documentation in `/docs/`

### Adding a New API Endpoint
1. Create route file: `/src/app/api/[endpoint]/route.ts`
2. Implement handler (GET, POST, etc.)
3. Add validation schema in `/src/lib/validations/`
4. Add business logic in `/src/lib/[service].ts`
5. Document in `/docs/`

### Database Changes
1. Update `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [description]`
3. Review generated migration in `/prisma/migrations/`
4. Update seed scripts if needed
5. Document schema changes in `/docs/`
