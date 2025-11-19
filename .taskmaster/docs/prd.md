# Job Search Automation Platform — Product Requirements Document

**Version**: 1.0  
**Date**: November 2025  
**Status**: Active Development  
**License**: MIT (Open Source)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Goals](#vision--goals)
3. [Core Problems Solved](#core-problems-solved)
4. [Target Users](#target-users)
5. [MVP Features](#mvp-features)
6. [Technical Architecture](#technical-architecture)
7. [Configuration System](#configuration-system)
8. [Deployment Options](#deployment-options)
9. [Success Metrics](#success-metrics)
10. [Future Roadmap](#future-roadmap)

---

## Executive Summary

An open-source, self-hosted job search automation platform that helps professionals find relevant opportunities faster through intelligent aggregation, AI-powered resume tailoring, and visual tracking. Fully configurable to work for any job market, location, or career level.

### Core Value Proposition

**Transform job searching from a 20-hour/week grind into a 2-hour/week strategic activity** through automation and intelligence.

### The Problem

- Manual job searching is time-consuming (20-40 hours/week)
- Tailoring resumes for each application takes 45-60 minutes
- Tracking applications across multiple platforms is chaotic
- Fresh postings get buried in aggregator noise
- Geographic searches are limited and inflexible
- No easy way to visualize opportunity landscape

### The Solution

A self-hosted platform that:
1. **Aggregates** jobs from multiple sources based on your criteria
2. **Filters** by location (radius-based), keywords, salary, and recency
3. **Tailors** resumes using AI (any OpenAI-compatible LLM)
4. **Visualizes** opportunities on an interactive map
5. **Tracks** applications through a customizable pipeline
6. **Configures** entirely through UI or config files (no code changes)

### Key Differentiators

- ✅ **100% Open Source** - MIT licensed, community-driven
- ✅ **Self-Hosted** - Your data stays on your server
- ✅ **Fully Configurable** - Cities, keywords, salary, sources - all editable
- ✅ **LLM Agnostic** - Works with OpenAI, Anthropic, Ollama, or any compatible API
- ✅ **Privacy First** - No tracking, no data selling, no vendor lock-in
- ✅ **Mobile Optimized** - Full functionality on phone/tablet

---

## Vision & Goals

### Vision

**Democratize access to intelligent job search tools** - making enterprise-grade automation available to everyone, regardless of budget or technical skill.

### Goals

1. **Efficiency**: Reduce job search time by 80% (20hrs/week → 2hrs/week)
2. **Quality**: Increase relevant matches through smart filtering
3. **Accessibility**: Easy setup for non-technical users
4. **Flexibility**: Adaptable to any job market or career level
5. **Privacy**: User maintains full control of their data

### Core Principles

1. **User Control**: Every parameter is configurable
2. **Transparency**: Open source code, clear data flows
3. **Simplicity**: Complex automation with simple UX
4. **Extensibility**: Plugin architecture for community additions

---

## Core Problems Solved

### For Job Seekers

#### Problem 1: Time Sink
**Current State**: Manually searching Indeed, LinkedIn, company sites takes hours daily.

**Solution**: Automated aggregation runs every 6 hours, surfaces only fresh postings (< 72 hours) matching your criteria.

**Impact**: 15 minutes to review 50 pre-filtered matches vs. 3 hours of manual searching.

---

#### Problem 2: Resume Tailoring Fatigue
**Current State**: Each application requires 45-60 min to customize resume/cover letter.

**Solution**: AI generates tailored resume in 30 seconds using your master profile + job description.

**Impact**: Apply to 6 high-quality jobs in 30 minutes instead of 6 hours.

---

#### Problem 3: Geographic Complexity
**Current State**: Targeting multiple cities means separate searches, inconsistent results.

**Solution**: Define multiple cities with radius (e.g., "Austin 35mi", "Denver 50mi"), weighted by preference.

**Impact**: See all opportunities on one map, prioritized by location preference.

---

#### Problem 4: Tracking Chaos
**Current State**: Spreadsheets, scattered notes, lost applications.

**Solution**: Kanban board tracks every application from discovery to outcome.

**Impact**: Never lose track of where you applied or when to follow up.

---

#### Problem 5: Stale Jobs
**Current State**: Apply to jobs posted 2 weeks ago (already filled).

**Solution**: Filter for postings within 24-72 hours (configurable).

**Impact**: Early applications = higher response rates.

---

## Target Users

### Primary: Any Professional Job Seeker

**Demographics**: Age 22-65, any industry, any experience level

**Use Cases**:
- Software engineers seeking remote roles
- Sales professionals targeting specific regions
- Career changers exploring multiple cities
- Executives conducting confidential searches
- Recent grads applying to entry-level positions

**Common Needs**:
- Reduce time spent searching
- Organize application process
- Tailor resumes efficiently
- Track multiple opportunities
- Visualize geographic options

**Technical Skill**: Ranges from non-technical (use Docker Compose) to technical (customize code)

---

### Secondary: Developers/Contributors

**Use Cases**:
- Extend platform with new features
- Add integrations (new job boards, APIs)
- Improve AI prompts
- Build plugins
- Contribute to docs

---

## MVP Features

### 1. User Configuration System 🎯 **P0**

**Description**: Onboarding flow where users define their job search parameters.

**Features**:
- Multi-step setup wizard (6 steps)
- **Step 1**: Target cities with radius (add unlimited cities)
- **Step 2**: Job categories/titles (e.g., "Software Engineer", "Sales Manager")
- **Step 3**: Include keywords (required terms like "Python", "Remote")
- **Step 4**: Exclude keywords (filter out "Intern", "Unpaid")
- **Step 5**: Salary range (min/max or "not disclosed")
- **Step 6**: Posting recency (24hr, 48hr, 72hr, 1week)
- **Optional**: Source weights, city priorities, daily application caps
- Export/import config as JSON
- Edit anytime via Settings page

**UI**: Clean wizard with progress indicator, "Skip" and "Back" buttons, helpful tooltips

**Tech**: React Hook Form + Zod validation, save to DB and `config.json`

---

### 2. Intelligent Job Aggregation 🔍 **P0**

**Description**: Automatically fetch and filter jobs from multiple sources.

**Data Sources** (Configurable):
- Indeed (RSS feeds + API)
- LinkedIn Jobs (scraping)
- Company career pages (direct scraping)
- GitHub Jobs (if available)
- Custom RSS feeds (user-provided)

**Filtering Logic**:
1. **Geographic**: Haversine distance from city centers (user-defined radius)
2. **Temporal**: Posted within X hours (user-configured)
3. **Keyword Match**: Include required keywords (OR logic), exclude blacklist (AND NOT)
4. **Salary**: Within user-defined range (if disclosed)
5. **Deduplication**: Detect same job across sources (fuzzy matching on title + company)

**Scoring System** (Optional):
- City weight (user preference: City A = 40%, City B = 25%, etc.)
- Category weight (preferred roles ranked higher)
- Source weight (direct company boards > aggregators)
- Composite score: `(city × 0.4) + (category × 0.4) + (source × 0.2)`

**Automation**: Runs every 6 hours via n8n workflows or cron jobs

**Tech**: n8n for orchestration, PostgreSQL for storage, Mapbox API for geocoding

---

### 3. AI-Powered Resume Tailoring 🤖 **P0**

**Description**: Generate customized resumes for each job using any OpenAI-compatible LLM.

**LLM Configuration** (User Selects):
- **Provider**: OpenAI, Anthropic (Claude), Ollama (local), OpenRouter, Azure OpenAI, or custom endpoint
- **Model**: GPT-4o, GPT-4o-mini, Claude Sonnet, Llama 3.1, Mixtral, etc.
- **Parameters**: Temperature (0.3-0.9), max tokens (500-4000)
- **API Key**: Stored in environment variables (never in code)

**Exaggeration Levels** (AI Temperature Mapping):
- **Conservative** (temp: 0.3): Factual, no embellishment
- **Balanced** (temp: 0.5): Professional emphasis of achievements
- **Strategic** (temp: 0.7): Confident, persuasive framing

**Process**:
1. Parse job description (extract required skills, responsibilities)
2. Match user's master profile to job requirements
3. Generate tailored resume sections:
   - Professional summary
   - Reordered work experience (relevant roles first)
   - Skills section (highlight matching skills)
   - Optional cover letter
4. Preview in browser (editable)
5. Export as ATS-friendly PDF

**File Naming**: `YYYY-MM-DD - [Company] - [Role].pdf` (configurable template)

**Tech**: LangChain for LLM abstraction, react-pdf for generation, ProseMirror for editing

---

### 4. Interactive Map Visualization 🗺️ **P0**

**Description**: Geographic view of all opportunities with smart filtering.

**Map Features**:
- **Base Map**: Mapbox GL JS (dark theme default, light mode toggle)
- **Job Markers**: Color-coded by score (green: top 20%, yellow: middle 60%, red: bottom 20%)
- **Radius Circles**: Visual representation of search radius around each city
- **Density Heatmap**: Toggle overlay showing job concentration
- **Clustering**: Group nearby jobs (expand on zoom)
- **Popups**: Click marker → job title, company, salary, score, "View Details" button
- **Filters**: Toggle by status (Interested, Applied, etc.), date range, score threshold

**Mobile**: Touch-optimized pinch/zoom, swipe gestures

**Tech**: Mapbox GL JS, React Map GL wrapper

---

### 5. Application Pipeline Tracker 📋 **P0**

**Description**: Kanban-style board to manage application lifecycle.

**Pipeline Stages** (Customizable):
1. **Discovered**: New jobs from aggregation
2. **Interested**: Marked for application
3. **Applied**: Resume sent
4. **Interview**: Scheduled or completed
5. **Offer**: Received offer
6. **Rejected**: Not moving forward
7. **Archived**: Old/irrelevant jobs

**Features**:
- Drag-and-drop between stages
- Status change timeline (audit log)
- Attach files (resume PDF, cover letter)
- Add notes to each application
- Quick actions: "Generate Resume", "Mark as Applied", "Archive"
- Bulk operations: Select multiple → Archive/Delete
- Search/filter by company, title, date, score

**Daily Caps** (Optional): Limit to X applications per day (prevent burnout)

**Export**: CSV download of all applications

**Tech**: dnd-kit for drag-and-drop, Prisma for DB, shadcn/ui for components

---

### 6. Master Profile Builder 📝 **P0**

**Description**: Single source of truth for user's career history (no verification, just storage).

**Sections**:
1. **Contact Info**: Name, email, phone, location, LinkedIn, GitHub
2. **Work History**: Company, title, dates, responsibilities (rich text), achievements
3. **Education**: School, degree, dates, GPA (optional), coursework
4. **Skills**: Technical skills (tags), proficiency level (self-assessed)
5. **Projects**: Personal/side projects, GitHub links, descriptions
6. **Certifications**: AWS, Google Cloud, PMP, etc.
7. **Preferences**: Desired roles, work mode (remote/hybrid/onsite), salary expectations

**Features**:
- Multi-step form with auto-save (every 30 seconds)
- Progress indicator (0-100% complete)
- Import from existing resume (GPT-4 Vision OCR, 80%+ accuracy)
- Export as JSON backup
- Rich text editor for descriptions

**Tech**: Tiptap for rich text, React Hook Form, Prisma schema

---

### 7. Configuration Management ⚙️ **P0**

**Description**: All settings editable via UI or direct file editing.

**Config File** (`config.json`):
```json
{
  "version": "1.0",
  "user_id": "user123",
  "search_parameters": {
    "cities": [
      {"name": "Austin, TX", "radius_miles": 35, "weight": 40},
      {"name": "Denver, CO", "radius_miles": 50, "weight": 30},
      {"name": "Seattle, WA", "radius_miles": 25, "weight": 30}
    ],
    "categories": ["Software Engineer", "Full Stack Developer", "Backend Engineer"],
    "salary_usd": {"min": 100000, "max": 180000},
    "remote_modes": ["remote", "hybrid"],
    "include_keywords": ["Python", "Django", "PostgreSQL", "AWS", "Remote"],
    "exclude_keywords": ["Intern", "Junior", "Unpaid", "Contract"],
    "posted_within_hours": 72,
    "max_results_per_source": 50
  },
  "llm_config": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.5,
    "max_tokens": 2000,
    "api_endpoint": "https://api.openai.com/v1"
  },
  "daily_caps": {
    "max_applications": 6,
    "max_tailored_resumes": 10
  },
  "file_naming_template": "YYYY-MM-DD - {company} - {role}.pdf"
}
```

**Settings UI**:
- Tabbed interface: Search, LLM, Automation, Advanced
- Live validation (e.g., "Radius must be 5-100 miles")
- Test LLM connection button
- Reset to defaults
- Version control (rollback to previous configs)

**Hot Reload**: Changes apply immediately (no restart needed)

**Tech**: JSON Schema validation, React Context for global config

---

### 8. Authentication & User Management 🔐 **P1**

**Description**: Simple, secure authentication for multi-user deployments.

**Primary Auth**: Google OAuth (via Clerk or NextAuth)
**Fallback**: Email/password with bcrypt

**Features**:
- JWT tokens, 30-day session
- Rate limiting (5 login attempts per 15 min)
- CSRF protection
- Optional 2FA/MFA (TOTP)

**Single-User Mode**: Skip auth entirely (set `SINGLE_USER_MODE=true` in env)

**Tech**: Clerk (managed) or NextAuth (self-hosted)

---

### 9. Mobile-First Responsive UI 📱 **P0**

**Description**: Full functionality on desktop, tablet, and mobile.

**Design System**:
- **Framework**: Next.js 14 + Tailwind CSS + shadcn/ui
- **Theme**: Dark mode default, light mode toggle
- **Color Palette**: Customizable (via CSS variables)
- **Typography**: Inter font family, 16px base size
- **Spacing**: 4px grid system

**Responsive Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Optimizations**:
- Touch targets: minimum 44×44px
- Swipe gestures on cards (swipe right = "Interested", left = "Not Interested")
- Bottom navigation for primary actions
- Collapsible filters/settings
- Lazy loading for map/images

**Performance Targets**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3s on 4G
- Lighthouse score > 90

**Primary Test Devices**: Google Pixel, iPhone 14, iPad Air

**Tech**: Tailwind responsive utilities, Framer Motion for animations

---

### 10. Dockerized Deployment 🐳 **P0**

**Description**: One-command deployment to any server or local machine.

**Docker Compose Stack**:
- **app**: Next.js application (port 3000)
- **db**: PostgreSQL 15 (port 5432)
- **n8n**: Workflow automation (port 5678)
- **nginx**: Reverse proxy with SSL (port 80/443)
- **redis**: Caching and rate limiting (port 6379)

**Deployment Options**:
1. **VPS** (Recommended): Ubuntu 22.04+, 2GB RAM minimum
2. **Local**: Docker Desktop on macOS/Windows/Linux
3. **Cloud**: DigitalOcean, AWS, GCP, Azure (one-click deploy)
4. **Raspberry Pi**: ARM64 support (experimental)

**SSL/HTTPS**: Automated via Let's Encrypt (Certbot)

**Environment Variables** (`.env` file):
```bash
DATABASE_URL="postgresql://user:pass@db:5432/jobsearch"
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# LLM Providers (configure one or more)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
OLLAMA_BASE_URL="http://localhost:11434"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk...."

# Optional
REDIS_URL="redis://redis:6379"
```

**Installation**:
```bash
git clone https://github.com/username/job-search-platform.git
cd job-search-platform
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d
```

**Updates**: `git pull && docker-compose up -d --build`

**Tech**: Multi-stage Dockerfile, Docker Compose v2, Nginx config

---

## Technical Architecture

### Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Mapbox GL JS
- Recharts (analytics)
- Framer Motion (animations)

**Backend**:
- Next.js API Routes (serverless functions)
- PostgreSQL (Supabase or self-hosted)
- Prisma ORM
- Redis (caching, rate limiting)

**AI/LLM**:
- LangChain (LLM abstraction)
- Support for: OpenAI, Anthropic, Ollama, OpenRouter, Azure OpenAI
- Custom endpoint support (any OpenAI-compatible API)

**Automation**:
- n8n (visual workflow builder)
- Cron jobs (fallback)
- Mapbox Geocoding API

**Infrastructure**:
- Docker + Docker Compose
- Nginx (reverse proxy)
- Let's Encrypt (SSL)
- GitHub Actions (CI/CD)

**Auth**:
- Clerk or NextAuth
- Optional: Single-user mode (no auth)

**Monitoring** (Optional):
- Sentry (error tracking)
- PostHog (analytics)
- Prometheus + Grafana (metrics)

---

### Database Schema (Prisma)

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  profile       Profile?
  applications  Application[]
  config        Config?
}

model Profile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  contactInfo   Json
  workHistory   Json[]
  education     Json[]
  skills        String[]
  projects      Json[]
  certifications Json[]
  preferences   Json
  completeness  Int      @default(0) // 0-100%
}

model Job {
  id              String   @id @default(cuid())
  title           String
  company         String
  location        String
  latitude        Float?
  longitude       Float?
  description     String   @db.Text
  salary          String?
  postedAt        DateTime
  source          String   // "indeed", "linkedin", "company_board"
  sourceUrl       String
  cityMatch       String?  // Which target city this matches
  distanceMiles   Float?
  compositeScore  Float?
  createdAt       DateTime @default(now())
  applications    Application[]
}

model Application {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  status      String   // "discovered", "interested", "applied", "interview", "offer", "rejected", "archived"
  resumePath  String?
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  appliedAt   DateTime?
  statusHistory Json[] // Timeline of status changes
}

model Config {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  searchParams    Json
  llmConfig       Json
  dailyCaps       Json
  fileNaming      String
  version         String   @default("1.0")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### LLM Integration (Provider Agnostic)

**Supported Providers**:

1. **OpenAI** (Default)
   - Models: GPT-4o, GPT-4o-mini, GPT-4-turbo
   - Endpoint: `https://api.openai.com/v1`
   - Env: `OPENAI_API_KEY`

2. **Anthropic (Claude)**
   - Models: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
   - Endpoint: `https://api.anthropic.com/v1`
   - Env: `ANTHROPIC_API_KEY`

3. **Ollama (Local)**
   - Models: Llama 3.1, Mixtral, Gemma 2, Phi-3
   - Endpoint: `http://localhost:11434/v1`
   - Env: `OLLAMA_BASE_URL`
   - No API key needed

4. **OpenRouter**
   - Access to 100+ models via single API
   - Endpoint: `https://openrouter.ai/api/v1`
   - Env: `OPENROUTER_API_KEY`

5. **Azure OpenAI**
   - Models: GPT-4, GPT-3.5-turbo
   - Endpoint: Custom per deployment
   - Env: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`

6. **Custom Endpoint**
   - Any OpenAI-compatible API
   - User provides endpoint URL + API key

**Implementation** (`src/lib/llm.ts`):
```typescript
import { ChatOpenAI } from '@langchain/openai';

export function getLLMClient(config: LLMConfig) {
  return new ChatOpenAI({
    modelName: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    openAIApiKey: config.apiKey,
    configuration: {
      baseURL: config.apiEndpoint,
    },
  });
}
```

**Resume Generation Prompt**:
```typescript
const systemPrompt = `You are an expert resume writer. Given a job description and a candidate's master profile, generate a tailored resume that:
1. Highlights relevant experience for this specific role
2. Uses keywords from the job description naturally
3. Reorders work history to prioritize relevant roles
4. Adjusts tone based on exaggeration level: ${exaggerationLevel}
   - Conservative: Factual, no embellishment
   - Balanced: Professional emphasis
   - Strategic: Confident, persuasive

Output should be ATS-friendly markdown format.`;

const userPrompt = `
Job Description:
${jobDescription}

Candidate Profile:
${JSON.stringify(userProfile)}

Generate tailored resume sections: Summary, Experience, Skills, Education.
`;
```

---

## Configuration System

### User-Facing Configuration

**Setup Wizard** (Initial Onboarding):

**Step 1: Target Cities**
```
┌─────────────────────────────────────────┐
│  Where are you looking for jobs?        │
├─────────────────────────────────────────┤
│  City 1: [Austin, TX     ▼]             │
│  Radius:  [35] miles                    │
│  Priority: ████████░░ 40%               │
│  [+ Add Another City]                   │
│                                         │
│  City 2: [Denver, CO     ▼]             │
│  Radius:  [50] miles                    │
│  Priority: ██████░░░░ 30%               │
│  [Remove]                               │
└─────────────────────────────────────────┘
[Back]                           [Next →]
```

**Step 2: Job Titles/Categories**
```
┌─────────────────────────────────────────┐
│  What job titles are you targeting?     │
├─────────────────────────────────────────┤
│  [Software Engineer            ] [Add]  │
│                                         │
│  Current list:                          │
│  • Software Engineer            [×]     │
│  • Full Stack Developer         [×]     │
│  • Backend Engineer             [×]     │
│                                         │
│  💡 Tip: Be specific but not too        │
│     narrow. "Software Engineer" is      │
│     better than "Senior Python Django   │
│     Kubernetes Software Engineer"       │
└─────────────────────────────────────────┘
[Back]                           [Next →]
```

**Step 3: Must-Have Keywords**
```
┌─────────────────────────────────────────┐
│  Required keywords (job must have at    │
│  least one of these)                    │
├─────────────────────────────────────────┤
│  [Python                       ] [Add]  │
│                                         │
│  • Python               [×]             │
│  • Django               [×]             │
│  • PostgreSQL           [×]             │
│  • AWS                  [×]             │
│  • Remote               [×]             │
│                                         │
│  💡 Use OR logic: job needs Python OR   │
│     Django OR PostgreSQL, etc.          │
└─────────────────────────────────────────┘
[Back]                           [Next →]
```

**Step 4: Exclude Keywords**
```
┌─────────────────────────────────────────┐
│  Filter out jobs with these terms       │
├─────────────────────────────────────────┤
│  [Intern                       ] [Add]  │
│                                         │
│  • Intern               [×]             │
│  • Junior               [×]             │
│  • Unpaid               [×]             │
│  • Contract             [×]             │
│                                         │
│  💡 Jobs containing ANY of these will   │
│     be automatically filtered out       │
└─────────────────────────────────────────┘
[Back]                           [Next →]
```

**Step 5: Salary Range**
```
┌─────────────────────────────────────────┐
│  What's your target salary range?       │
├─────────────────────────────────────────┤
│  Minimum: [$100,000        ]            │
│  Maximum: [$180,000        ]            │
│                                         │
│  ☐ Include jobs without salary info     │
│                                         │
│  💡 Many jobs don't list salary. We     │
│     recommend including them.           │
└─────────────────────────────────────────┘
[Back]                           [Next →]
```

**Step 6: Job Freshness**
```
┌─────────────────────────────────────────┐
│  How recent should jobs be?             │
├─────────────────────────────────────────┤
│  ○ Last 24 hours (freshest)             │
│  ○ Last 48 hours (recommended)          │
│  ● Last 72 hours (balanced)             │
│  ○ Last week (more options)             │
│                                         │
│  💡 Applying within 48-72 hours gives   │
│     you a significant advantage         │
└─────────────────────────────────────────┘
[Back]                      [Complete ✓]
```

---

### Developer Configuration

**Environment Variables** (`.env`):
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/jobsearch"

# Auth (choose one)
NEXTAUTH_SECRET="generate-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
# OR
CLERK_SECRET_KEY="sk_..."

# LLM Providers (add the ones you'll use)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
OLLAMA_BASE_URL="http://localhost:11434"
OPENROUTER_API_KEY="sk-or-..."
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="https://..."

# Mapbox (required for map features)
NEXT_PUBLIC_MAPBOX_TOKEN="pk...."

# Optional
REDIS_URL="redis://localhost:6379"
SENTRY_DSN="https://..."
POSTHOG_API_KEY="phc_..."

# Single-user mode (skip auth)
SINGLE_USER_MODE="false"
```

**Feature Flags** (`config/features.json`):
```json
{
  "enableAuth": true,
  "enableAnalytics": false,
  "enableMapHeatmap": true,
  "enableDailyCaps": true,
  "enableFileNaming": true,
  "llmProviders": ["openai", "anthropic", "ollama"],
  "jobSources": ["indeed", "linkedin", "company_boards"],
  "maxCitiesPerUser": 10,
  "maxApplicationsPerDay": 20
}
```

---

## Deployment Options

### Option 1: VPS (DigitalOcean, Linode, Vultr) — Recommended

**Requirements**:
- Ubuntu 22.04 LTS
- 2GB RAM minimum (4GB recommended)
- 20GB SSD storage
- Docker + Docker Compose installed

**Quick Start**:
```bash
# SSH into VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo
git clone https://github.com/yourusername/job-search-platform.git
cd job-search-platform

# Configure
cp .env.example .env
nano .env  # Add your API keys

# Deploy
docker-compose up -d

# Setup SSL (if you have a domain)
./scripts/setup-ssl.sh yourdomain.com
```

**Cost**: $12-24/month (DO Droplet or Linode Nanode)

---

### Option 2: Local Development

**Requirements**:
- macOS, Windows (WSL2), or Linux
- Docker Desktop installed
- Node.js 18+ (for local development without Docker)

**Setup**:
```bash
git clone https://github.com/yourusername/job-search-platform.git
cd job-search-platform

# Install dependencies
npm install

# Setup database
docker-compose up -d db redis

# Configure
cp .env.example .env
# Edit .env with your keys

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

**Access**: http://localhost:3000

---

### Option 3: Cloud Providers (One-Click Deploy)

**Railway** (Easiest):
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=...)

**Vercel + Supabase**:
1. Fork repo
2. Import to Vercel
3. Connect Supabase database
4. Add environment variables
5. Deploy

**DigitalOcean App Platform**:
1. Import from GitHub
2. Configure build settings
3. Add managed PostgreSQL
4. Deploy

**Cost**: $5-25/month depending on usage

---

### Option 4: Raspberry Pi (ARM64)

**Requirements**:
- Raspberry Pi 4 (4GB+ RAM)
- Raspberry Pi OS 64-bit
- Docker installed

**Setup**: Same as VPS, but uses ARM64 Docker images

**Use Case**: Ultra-low-cost self-hosting ($50 one-time + electricity)

---

## Success Metrics

### User Engagement
- **Daily Active Users**: % of users who log in daily
- **Profile Completion Rate**: % of users with >80% profile filled
- **Configuration Completion**: % of users who complete setup wizard
- **Session Duration**: Average time spent per visit (target: 15-30 min)

### Job Search Efficiency
- **Jobs Reviewed per Session**: Average number of jobs evaluated (target: 20-50)
- **Time to First Application**: Days from signup to first application (target: <2 days)
- **Applications per Week**: Average applications submitted (target: 5-10)
- **Resume Generation Usage**: % of applications using AI tailoring (target: >80%)

### Technical Performance
- **Uptime**: 99.5%+
- **API Response Time**: <200ms for 95th percentile
- **Job Aggregation Freshness**: <6 hours lag
- **LLM Response Time**: <10 seconds for resume generation

### Community Growth (Open Source)
- **GitHub Stars**: Community interest indicator
- **Contributors**: Number of active contributors
- **Issues Closed**: Community support engagement
- **Deployments**: Estimated instances running (telemetry opt-in)

---

## Future Roadmap

### Phase 2: Intelligence Layer (3-6 months post-MVP)
- GitHub integration (analyze public repos for skill extraction)
- Company health scoring (Glassdoor + news aggregation)
- Semantic job matching (vector embeddings instead of keywords)
- Stack Overflow integration

### Phase 3: Advanced Features (6-12 months)
- Browser extension (quick-apply from any job board)
- Mobile apps (iOS/Android with React Native)
- Email integration (auto-track application responses)
- Interview prep assistant (AI-generated Q&A based on job)

### Phase 4: Community Features (12-18 months)
- Public job board (aggregated opportunities)
- Anonymous salary sharing (crowdsourced compensation data)
- Referral network (connect with employees at target companies)
- Success stories/testimonials

### Phase 5: Ecosystem (18-24 months)
- Plugin marketplace (community-built extensions)
- API platform (third-party integrations)
- White-label option (companies can deploy for internal job search)
- Advanced analytics (ML-based offer prediction)

---

## License & Contributing

**License**: MIT (fully open source)

**Contributing**:
- Fork repo and create feature branch
- Follow code style guidelines (ESLint + Prettier)
- Write tests for new features
- Submit PR with clear description
- Maintain backward compatibility

**Code of Conduct**: Be respectful, inclusive, and collaborative

**Documentation**: All features must include user docs and code comments

---

## Getting Started

Ready to take control of your job search? 

1. **Star the repo**: https://github.com/yourusername/job-search-platform
2. **Read the docs**: Full setup guide in `README.md`
3. **Deploy**: One-click or VPS instructions above
4. **Configure**: 5-minute wizard to set your preferences
5. **Search smarter**: Let automation do the heavy lifting

**Questions?** Open an issue or join our Discord community.

**Built something cool?** Share it! We'd love to see your customizations.

---

**Let's democratize intelligent job search. One deployment at a time.** 🚀
