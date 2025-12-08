# Task ID: 11

**Title:** Initialize Next.js 14 Project with Core Dependencies and Docker Configuration

**Status:** done

**Dependencies:** None

**Priority:** high

**Description:** Set up the foundational Next.js 14 project structure with TypeScript, configure Docker Compose stack (app, PostgreSQL 15, n8n, nginx, Redis), and establish the development environment with all required dependencies.

**Details:**

1. Initialize Next.js 14 project with App Router and TypeScript:
   ```bash
   npx create-next-app@latest job-search-platform --typescript --tailwind --app --src-dir
   ```

2. Install core dependencies:
   ```bash
   npm install @prisma/client prisma zod react-hook-form @hookform/resolvers
   npm install @langchain/openai @langchain/anthropic langchain
   npm install mapbox-gl react-map-gl @dnd-kit/core @dnd-kit/sortable
   npm install @radix-ui/react-* (shadcn/ui components)
   npm install next-auth bcrypt jsonwebtoken
   npm install framer-motion recharts
   npm install -D @types/node @types/react @types/mapbox-gl
   ```

3. Create Docker Compose configuration (docker-compose.yml):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - '3000:3000'
       environment:
         - DATABASE_URL=postgresql://user:pass@db:5432/jobsearch
       depends_on:
         - db
         - redis
     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: pass
         POSTGRES_DB: jobsearch
       volumes:
         - postgres_data:/var/lib/postgresql/data
     n8n:
       image: n8nio/n8n
       ports:
         - '5678:5678'
       environment:
         - N8N_BASIC_AUTH_ACTIVE=true
       volumes:
         - n8n_data:/home/node/.n8n
     redis:
       image: redis:7-alpine
       ports:
         - '6379:6379'
     nginx:
       image: nginx:alpine
       ports:
         - '80:80'
         - '443:443'
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
   volumes:
     postgres_data:
     n8n_data:
   ```

4. Create multi-stage Dockerfile for Next.js app
5. Set up .env.example with all required environment variables
6. Configure tsconfig.json with path aliases (@/ for src/)
7. Initialize Git repository with .gitignore

**Test Strategy:**

1. Verify Docker Compose stack starts successfully: `docker-compose up -d`
2. Confirm all services are healthy: `docker-compose ps`
3. Test Next.js dev server runs: `npm run dev` accessible at localhost:3000
4. Verify PostgreSQL connection: `docker exec -it <db-container> psql -U user -d jobsearch`
5. Check n8n interface loads at localhost:5678
6. Validate TypeScript compilation: `npm run build`
7. Ensure all dependencies install without conflicts

## Subtasks

### 11.1. Initialize Next.js 14 project with App Router and TypeScript

**Status:** done  
**Dependencies:** None  

Set up the foundational Next.js 14 project structure using create-next-app CLI with App Router and TypeScript

**Details:**

Execute npx create-next-app@latest job-search-platform --typescript --tailwind --app --src-dir to create project structure with TypeScript, Tailwind CSS, App Router, and src directory organization. Verify proper file structure including app/layout.tsx and page.tsx
<info added on 2025-11-19T11:43:01.958Z>
Plan:
1. Create a verification script tests/verify_project_structure.js to check for the existence of job-search-platform and key files (package.json, tsconfig.json, src/app).
2. Run the verification script (expect failure).
3. Execute npx create-next-app@latest job-search-platform --typescript --tailwind --app --src-dir --no-eslint --no-import-alias.
4. Verify the installation.
5. Run the verification script (expect success).
</info added on 2025-11-19T11:43:01.958Z>

### 11.2. Install and organize core dependencies for job search platform

**Status:** done  
**Dependencies:** 11.1  

Install all required npm packages including Prisma, LangChain, UI components, and authentication libraries

**Details:**

Execute npm install commands for @prisma/client, zod, react-hook-form, LangChain packages, mapbox-gl, shadcn/ui components, next-auth, and development dependencies; verify package.json contains all required dependencies with proper version ranges
<info added on 2025-11-19T17:04:49.945Z>
Plan:
1. Create `tests/verify_dependencies.js` to check `job-search-platform/package.json` for required dependencies.
2. Run verification (expect failure).
3. Install dependencies:
   - Core: `npm install @prisma/client zod react-hook-form @hookform/resolvers next-auth bcrypt jsonwebtoken framer-motion recharts`
   - AI: `npm install @langchain/openai @langchain/anthropic langchain`
   - Maps/UI: `npm install mapbox-gl react-map-gl @dnd-kit/core @dnd-kit/sortable`
   - Dev: `npm install -D prisma @types/mapbox-gl @types/bcrypt @types/jsonwebtoken`
4. Run verification (expect success).
</info added on 2025-11-19T17:04:49.945Z>

### 11.3. Configure Docker Compose stack with all required services

**Status:** done  
**Dependencies:** 11.1, 11.2  

Set up docker-compose.yml with Next.js app, PostgreSQL 15, n8n, Redis, and nginx services with proper networking

**Details:**

Create docker-compose.yml with services for app, db (PostgreSQL 15), n8n, redis, and nginx; configure proper ports, environment variables, volumes, and service dependencies; ensure networking between containers is correctly configured with appropriate health checks
<info added on 2025-11-19T17:06:35.598Z>
Plan:
1. Create tests/verify_docker_compose.js to validate docker-compose.yml exists and contains required services (app, db, n8n, redis, nginx).
2. Run verification (expect failure).
3. Create job-search-platform/docker-compose.yml with defined services and configuration.
4. Create job-search-platform/nginx.conf for the nginx service.
5. Run verification (expect success).
</info added on 2025-11-19T17:06:35.598Z>

### 11.4. Create optimized multi-stage Dockerfile for Next.js application

**Status:** done  
**Dependencies:** 11.1, 11.2, 11.3  

Implement efficient Docker build process with separate build and runtime stages to minimize image size

**Details:**

Create Dockerfile with builder stage (Node.js with dependencies) and runtime stage (minimal production build); copy only necessary files between stages; optimize layer caching; configure proper working directory and command execution for both development and production environments
<info added on 2025-11-19T17:07:38.896Z>
Plan:
1. Create `tests/verify_dockerfile.js` to validate `Dockerfile` exists and uses multi-stage build (checks for 'FROM ... AS builder' and 'FROM ... AS runner').
2. Run verification (expect failure).
3. Create `job-search-platform/Dockerfile` with optimized multi-stage build for Next.js.
4. Run verification (expect success).
</info added on 2025-11-19T17:07:38.896Z>

### 11.5. Implement environment variable management with .env files

**Status:** done  
**Dependencies:** 11.1, 11.2, 11.3, 11.4  

Create comprehensive environment variable system with .env.example and validation

**Details:**

Create .env.example with all required environment variables (DATABASE_URL, API keys, etc.); implement validation mechanism using Zod; configure Next.js to properly load environment variables in development and production; document all required variables with examples and security considerations
<info added on 2025-11-19T17:08:40.214Z>
Plan:
1. Create `tests/verify_env.js` to validate `.env.example` exists and `src/env.ts` (validation logic) exists.
2. Run verification (expect failure).
3. Create `job-search-platform/.env.example` with keys: DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_MAPBOX_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY.
4. Create `job-search-platform/src/env.ts` using Zod for validation.
5. Run verification (expect success).
</info added on 2025-11-19T17:08:40.214Z>

### 11.6. Configure TypeScript with path aliases and typed routes

**Status:** done  
**Dependencies:** 11.1, 11.2, 11.5  

Set up advanced TypeScript configuration including path aliases and typed route validation

**Details:**

Configure tsconfig.json with path aliases (@/ for src/); enable typedRoutes in next.config.js; set up proper module resolution; configure TypeScript for Next.js App Router; validate TypeScript configuration with sample components using Route type from next package
<info added on 2025-11-19T17:09:38.512Z>
Plan:
1. Create `tests/verify_tsconfig.js` to validate:
   - `tsconfig.json` has `compilerOptions.paths` containing `"@/*": ["./src/*"]`.
   - `next.config.ts` has `experimental: { typedRoutes: true }`.
2. Run verification (expect failure on typedRoutes).
3. Modify `job-search-platform/next.config.ts` to add `typedRoutes: true`.
4. Run verification (expect success).
</info added on 2025-11-19T17:09:38.512Z>
