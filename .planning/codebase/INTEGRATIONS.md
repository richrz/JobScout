# External Integrations

## Authentication & Identity

### Google OAuth 2.0
- **Provider**: Google Cloud Console
- **Flow**: NextAuth.js GoogleProvider
- **Config**:
  - `GOOGLE_CLIENT_ID`: OAuth app ID
  - `GOOGLE_CLIENT_SECRET`: OAuth app secret
  - Authorized redirect: `{NEXTAUTH_URL}/api/auth/callback/google`
  - Authorized JavaScript origin: `{NEXTAUTH_URL}`
- **Scope**: Default (profile, email)
- **Adapter**: Prisma (stores Account, Session, User)

### Credentials Authentication
- **Type**: Email + password (bcrypt hashed)
- **Dev Bypass**: `dev@localhost` / `devpass123` in non-production
- **Storage**: Prisma User model (password field)
- **Session**: JWT-based (30-day max age)

## Job Data Ingestion

### JSearch API (Google for Jobs Aggregator)
- **Endpoint**: RapidAPI JSearch
- **Auth**: `JSEARCH_API_KEY` (API key)
- **Query**: Location-based (e.g., "IT jobs in Kansas City Missouri")
- **Response Format**: JSON with job_title, employer_name, job_description, job_salary, job_apply_link, job_posted_at_datetime_utc
- **Rate Limiting**: Configurable via rate-limit.ts
- **Usage**: Primary job source for ingestion pipeline
- **Fallback**: Mock data in NEXT_PUBLIC_MOCK_MODE

### N8N Workflow Automation
- **Service**: n8n (Docker: n8nio/n8n)
- **Port**: 5678
- **Auth**: Basic auth (N8N_BASIC_AUTH_ACTIVE=true)
- **Volume**: n8n_data (persistent workflows)
- **Purpose**: Job scraping orchestration, webhook triggers, data transformation
- **Integration**: Triggered via API routes or cron jobs

### Web Scraping
- **Library**: Cheerio 1.1.2 (HTML parsing)
- **Sources**: Indeed, LinkedIn, company career pages
- **Selectors**: Configurable per company (CompanyScraperConfig)
- **Output**: JobListing objects (title, company, location, description, salary, postedAt, source, sourceUrl)

## Geolocation & Maps

### Google Maps API
- **Services**:
  - **Geocoding**: Address → lat/lng conversion
  - **Maps Display**: Interactive job location map
  - **Marker Clustering**: @googlemaps/markerclusterer
- **Auth**: `GOOGLE_MAPS_API_KEY` (API key)
- **Client**: @googlemaps/google-maps-services-js
- **Caching**: Redis (30-day TTL for geocoding results)
- **React Component**: @vis.gl/react-google-maps
- **Mock Mode**: Deterministic coordinates based on location string hash

### Google Cloud Talent Solution (CTS)
- **Service**: Google Cloud Talent Solution API
- **Auth**: Service account JSON (GOOGLE_APPLICATION_CREDENTIALS path)
- **Project**: `GOOGLE_CLOUD_PROJECT_ID`
- **Tenant**: `CTS_TENANT_ID` (default: "default")
- **Clients**:
  - JobServiceClient: Create, search, update jobs
  - CompanyServiceClient: Manage company entities
  - TenantServiceClient: Tenant lifecycle
- **Features**:
  - Semantic job search (embeddings-based)
  - Commute time filtering
  - Company entity resolution
- **Dual-Write**: Jobs written to both Postgres (user state) and CTS (search index)
- **Status Endpoint**: `/api/admin/cts-status` (health check)

## LLM & AI Services

### OpenAI
- **Auth**: `OPENAI_API_KEY`
- **Models**:
  - gpt-5-nano-2025-08-07 (resume parser default)
  - gpt-4, gpt-4-turbo (configurable)
- **Integration**: @langchain/openai
- **Use Cases**:
  - Resume generation and tailoring
  - ATS score analysis
  - Skill extraction
  - Job description parsing
- **Temperature**: Configurable per task (exaggeration map: 0.3–0.9)
- **Max Tokens**: Configurable (default: 2000)
- **Retry Logic**: 3 retries on 429/5xx errors

### Anthropic (Claude)
- **Auth**: `ANTHROPIC_API_KEY`
- **Base URL**: `ANTHROPIC_BASE_URL` (optional, defaults to Anthropic)
- **Integration**: @langchain/anthropic
- **Models**: Claude 3 family (configurable)
- **Use Cases**: Resume generation, analysis, long-context tasks
- **Connection Test**: `/api/llm/test-connection`

### Google Gemini
- **Auth**: `GOOGLE_API_KEY`
- **Integration**: @langchain/google-genai
- **Models**: Gemini Pro, Gemini 1.5 (configurable)
- **Use Cases**: Resume analysis, skill suggestions

### Azure OpenAI
- **Auth**: `AZURE_OPENAI_API_KEY`
- **Endpoint**: `AZURE_OPENAI_ENDPOINT`
- **Integration**: Custom endpoint support via LangChain
- **Use Cases**: Enterprise deployments with Azure infrastructure

### OpenRouter
- **Auth**: `OPENROUTER_API_KEY`
- **Purpose**: Multi-model routing and fallback
- **Integration**: LangChain community

### Ollama (Local)
- **Endpoint**: `OLLAMA_BASE_URL` (default: http://localhost:11434/v1)
- **Purpose**: Local LLM inference (no API key required)
- **Use Cases**: Development, privacy-sensitive deployments

### Mem0 (Long-Term Memory)
- **Service**: Mem0 API (https://api.mem0.ai)
- **Auth**: `MEM0_API_KEY` or `mem0_api_key`
- **Base URL**: `MEM0_API_BASE_URL` (optional)
- **Endpoints**:
  - POST `/v1/memories/`: Add profile facts
  - POST `/v2/memories/search/`: Retrieve relevant memories
- **Use Cases**:
  - Store candidate profile facts (skills, experience, preferences)
  - Retrieve context for resume tailoring
  - Long-term candidate memory across sessions
- **Metadata**: source (profile_save), section (career_profile)
- **Optional**: Disabled if API key not set

## Vector Database & Embeddings

### Qdrant
- **Client**: @qdrant/js-client-rest 1.16.2
- **Purpose**: Vector similarity search for ATS scoring and resume analysis
- **Collections**: Configurable per use case
- **Integration**: Used in ats-analyzer.ts for embedding-based matching
- **Connection**: REST API (configurable endpoint)

## Caching & Session Storage

### Redis
- **Service**: redis:7-alpine (Docker)
- **Port**: 6379
- **Client**: ioredis 5.8.2
- **Use Cases**:
  - Geocoding result caching (30-day TTL)
  - Session data (via NextAuth)
  - Rate limiting state
  - Temporary job processing state
- **Connection**: `REDIS_URL` (default: redis://localhost:6379)

## Database

### PostgreSQL
- **Service**: postgres:15-alpine (Docker)
- **Port**: 5432 (internal), 5435 (exposed in docker-compose)
- **Database**: jobsearch
- **Credentials**: user/pass (configurable)
- **ORM**: Prisma 5.22.0
- **Models**:
  - User, Profile, Session, Account (auth)
  - Job, Application, Workspace (job pipeline)
  - Resume, Artifact, WarRoomNote (workspace artifacts)
  - Config, ConfigHistory (user settings)
  - Company, ObservedListing, DedupeDecision (ingestion)
- **Migrations**: prisma/migrations/ (version-controlled)
- **Indexes**: Optimized for job search, user queries, status filtering

## Webhooks & Event Triggers

### Cron Jobs
- **Library**: node-cron 4.2.1
- **Endpoint**: `/api/cron/lifecycle` (protected by CRON_SECRET)
- **Tasks**:
  - Job lifecycle management (stale job cleanup)
  - Application status transitions
  - Resume expiration
- **Frequency**: Configurable per task

### API Hardening
- **CRON_SECRET**: Optional secret for cron endpoint protection
- **Rate Limiting**: Custom rate-limit.ts implementation
- **CSRF Protection**: csrf.ts utilities

## Document Processing & Export

### Resume Export (DOCX)
- **Library**: docx 9.6.0
- **Endpoint**: `/api/resume/export/docx`
- **Output**: .docx file with formatted resume
- **Styling**: Tailored to ATS compatibility

### Resume Import (PDF/DOCX)
- **PDF Parsing**: pdf-parse 2.4.5, pdfjs-dist 5.4.296
- **DOCX Parsing**: mammoth 1.11.0
- **Endpoint**: `/api/profile/import-resume`
- **Output**: Extracted text, structured profile data
- **Service**: profile-import-service.ts

## Analytics & Monitoring

### Dashboard Analytics
- **Endpoint**: `/api/analytics/dashboard`
- **Metrics**:
  - Market Velocity (area chart)
  - Salary Landscape (bar chart)
  - Pipeline Health (donut chart: Active/Follow-up/Dormant/Archived)
- **Data Source**: Prisma queries on Job, Application, Workspace models

## Configuration & Admin

### Config API
- **Endpoint**: `/api/config`
- **Purpose**: Retrieve app configuration (LLM providers, feature flags)
- **Response**: LLM provider list, default models, feature availability

### Admin Endpoints
- **CTS Status**: `/api/admin/cts-status` (health check)
- **Trigger Aggregation**: `/api/admin/trigger-aggregation` (manual job sync)
- **Simulation**: `/api/simulation` (test data generation)

## Development & Testing

### Mock Mode
- **Flag**: `NEXT_PUBLIC_MOCK_MODE=true`
- **Behavior**:
  - Geocoding returns deterministic coordinates
  - JSearch returns mock job data
  - Google OAuth uses mock flow
  - No external API calls
- **Use Cases**: Development, CI/CD, demos

### Demo Scripts
- **Location**: scripts/demo-*.ts
- **Examples**:
  - demo-task-20-backend.ts (resume generation)
  - demo-task-38.ts through demo-task-42.ts (feature demos)
  - demo-chronos.ts (time-based testing)
- **Runner**: `npx tsx scripts/demo-*.ts`

## Security & Secrets

### Environment Variables
- **Sensitive**: NEXTAUTH_SECRET, API keys (OpenAI, Anthropic, Google, etc.)
- **Storage**: .env.local (git-ignored), .env.example (template)
- **Rotation**: Supported via environment updates
- **Validation**: Checked at startup for required keys

### API Key Management
- **OpenAI**: OPENAI_API_KEY
- **Anthropic**: ANTHROPIC_API_KEY
- **Google**: GOOGLE_API_KEY, GOOGLE_MAPS_API_KEY, GOOGLE_APPLICATION_CREDENTIALS
- **Mem0**: MEM0_API_KEY
- **JSearch**: JSEARCH_API_KEY
- **OpenRouter**: OPENROUTER_API_KEY
- **Azure**: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT

## Deployment Infrastructure

### Docker Compose Services
- **app**: Next.js application (port 3000)
- **db**: PostgreSQL (port 5435)
- **redis**: Redis cache (port 6379)
- **n8n**: Workflow automation (port 5678)
- **nginx**: Reverse proxy (ports 80, 443)

### Volumes
- **postgres_data**: PostgreSQL persistence
- **n8n_data**: N8N workflow persistence

### Network
- Services communicate via Docker network (service names as hostnames)
- External access via exposed ports
