# Technology Stack

## Runtime & Core Framework

- **Node.js**: 18+ (Alpine-based Docker image)
- **Next.js**: 16.1.6 (React framework with App Router)
- **React**: 19.2.0 (UI library)
- **TypeScript**: 5.x (strict mode enabled)

## Language & Build

- **Language**: TypeScript (strict: true)
- **Module System**: ESNext with bundler resolution
- **Build Tool**: Next.js built-in (Turbopack)
- **Linting**: ESLint 9.x with Next.js config
- **CSS Processing**: PostCSS 8.5.6 with Tailwind

## Styling & UI Components

- **CSS Framework**: Tailwind CSS 3.4.18
- **Component Library**: Mantine 8.3.11 (core + hooks)
- **Headless UI**: Radix UI (accordion, checkbox, collapsible, dialog, dropdown, label, popover, progress, select, separator, slider, switch, tabs, toggle, tooltip)
- **Icons**: Lucide React 0.555.0
- **Animation**: Framer Motion 12.23.24
- **Utilities**: clsx 2.1.1, tailwind-merge 3.4.0, class-variance-authority 0.7.1

## 3D & Visualization

- **3D Graphics**: Three.js 0.183.1
- **React 3D**: @react-three/fiber 9.5.0, @react-three/drei 10.7.7
- **Charts**: Recharts 3.6.0 (area, bar, donut charts)
- **Rich Text Editor**: TipTap 3.11.0 (with starter-kit, placeholder extension)
- **Block Editor**: BlockNote 0.47.1 (Mantine integration)

## Database & ORM

- **Database**: PostgreSQL 15 (Docker: postgres:15-alpine)
- **ORM**: Prisma 5.22.0
- **Migrations**: Prisma migrations (prisma/migrations/)
- **Schema**: prisma/schema.prisma (User, Profile, Job, Application, Workspace, Resume, Config, Company, ObservedListing, DedupeDecision models)

## Authentication & Authorization

- **Auth Framework**: NextAuth.js 4.24.13
- **Adapter**: @next-auth/prisma-adapter 1.0.7
- **Providers**:
  - Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  - Credentials (email/password with bcrypt)
- **Session Strategy**: JWT (30-day max age)
- **Password Hashing**: bcryptjs 3.0.3, bcrypt 6.0.0

## Caching & State

- **Cache Layer**: Redis 7 (Docker: redis:7-alpine)
- **Redis Client**: ioredis 5.8.2
- **Cache TTL**: 30 days for geocoding results
- **Session Storage**: Prisma (via NextAuth adapter)

## Vector Database & Semantic Search

- **Vector DB**: Qdrant (via @qdrant/js-client-rest 1.16.2)
- **Embeddings**: LangChain integration (see LLM section)
- **Use Case**: ATS scoring, resume analysis, semantic job matching

## LLM & AI Integration

- **LangChain**: 1.0.6 (core orchestration)
- **LangChain Providers**:
  - @langchain/openai 1.1.3 (OpenAI/GPT models)
  - @langchain/anthropic 1.2.1 (Claude models)
  - @langchain/google-genai 2.1.0 (Google Gemini)
  - @langchain/community 1.0.4 (community integrations)
- **Supported Models**:
  - OpenAI: gpt-5-nano-2025-08-07 (resume parser default)
  - Anthropic: Claude (via API key)
  - Google: Gemini (via API key)
  - Ollama: Local inference (http://localhost:11434/v1)
  - Azure OpenAI: Custom endpoint support
  - OpenRouter: Multi-model routing
- **Configuration**: LLMConfig type with provider, model, temperature, maxTokens, maxRetries

## Document Processing

- **PDF Parsing**: pdf-parse 2.4.5, pdfjs-dist 5.4.296
- **PDF Rendering**: @react-pdf/renderer 4.3.1, react-pdf 10.2.0
- **Word Documents**: mammoth 1.11.0 (DOCX parsing)
- **Document Generation**: docx 9.6.0 (DOCX export)
- **HTML Parsing**: Cheerio 1.1.2 (job scraping)

## Forms & Validation

- **Form Library**: React Hook Form 7.68.0
- **Validation**: Zod 3.25.76 (schema validation)
- **Resolvers**: @hookform/resolvers 5.2.2

## Testing

- **Unit Tests**: Jest 30.2.0
- **Jest Config**: jest.config.js
- **Test Environment**: jest-environment-jsdom 30.2.0
- **Testing Library**: @testing-library/react 16.3.0, @testing-library/dom 10.4.1, @testing-library/jest-dom 6.9.1
- **E2E Tests**: Playwright 1.58.0 (smoke + full test suites)
- **Playwright Config**: playwright.config.ts

## Utilities & Helpers

- **JSON Schema**: ajv 8.17.1 (validation)
- **Fuzzy Search**: fuse.js 7.1.0
- **Similarity**: cosine-similarity 1.0.1
- **JWT**: jsonwebtoken 9.0.2
- **Environment**: dotenv 17.2.3
- **Notifications**: sonner 2.0.7 (toast notifications)
- **Swipe Gestures**: react-swipeable 7.0.2
- **Theme Management**: next-themes 0.4.6

## Maps & Geolocation

- **Maps Library**: @vis.gl/react-google-maps 1.4.2
- **Google Maps Services**: @googlemaps/google-maps-services-js 3.4.0
- **Marker Clustering**: @googlemaps/markerclusterer 2.6.2
- **Geocoding**: Custom wrapper with Redis caching

## External Services

- **Google Cloud Talent Solution**: @google-cloud/talent 7.1.1 (semantic search, commute filters)
- **Mem0 API**: Long-term memory for candidate profiles (optional)
- **JSearch API**: Job aggregator (Google for Jobs)
- **N8N**: Workflow automation (Docker service)

## Development Tools

- **Type Checking**: TypeScript compiler
- **Path Aliases**: tsconfig-paths 4.2.0 (@/* → ./src/*)
- **Node Utilities**: @types/node 20.19.25
- **Cron Jobs**: node-cron 4.2.1
- **Script Runner**: ts-node 10.9.2, tsx (for demo scripts)
- **Autoprefixer**: 10.4.22

## Configuration Files

- **TypeScript**: tsconfig.json (ES2017 target, strict mode)
- **Next.js**: next.config.js (outputFileTracingRoot)
- **Tailwind**: tailwind.config.js
- **PostCSS**: postcss.config.mjs
- **ESLint**: eslint.config.mjs
- **Jest**: jest.config.js
- **Playwright**: playwright.config.ts
- **Prisma**: prisma.config.ts

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Auth callback URL
- `NEXTAUTH_SECRET`: Session encryption key

### Optional (Feature Flags)
- `JSEARCH_API_KEY`: Job scraping API
- `GOOGLE_MAPS_API_KEY`: Geocoding and maps
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: LLM providers
- `REDIS_URL`: Cache layer
- `GOOGLE_CLOUD_PROJECT_ID`, `CTS_TENANT_ID`: Cloud Talent Solution
- `SINGLE_USER_MODE`: Dev mode (no auth)
- `NEXT_PUBLIC_MOCK_MODE`: Mock data mode

## Deployment

- **Docker**: Multi-stage build (deps → builder → runner)
- **Base Image**: node:18-alpine
- **Port**: 3000 (configurable via PORT env var)
- **Output**: Next.js standalone output with static tracing
- **Reverse Proxy**: Nginx (docker-compose)

## Package Management

- **Package Manager**: npm (package-lock.json)
- **Lockfile**: package-lock.json
- **Seed Script**: Prisma seed (ts-node with CommonJS)
