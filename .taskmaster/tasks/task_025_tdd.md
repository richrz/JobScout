# Task ID: 25

**Title:** Implement Database-Free Mock Mode and Data Fallbacks

**Status:** pending

**Dependencies:** 12 ✓, 21 ✓

**Priority:** medium

**Description:** Develop a mock data layer that intercepts database calls when the application is in 'Mock Mode', enabling full UI navigation, testing, and building without active PostgreSQL or Redis connections.

**Details:**

1. **Environment Configuration**: Add `NEXT_PUBLIC_MOCK_MODE` to `.env` and create a utility to check this status.
2. **Mock Data Generators**: Install `@faker-js/faker` and create factory functions for all Prisma models defined in Task 12 (User, Profile, Job, Application, Config). Ensure data adheres to the schema types.
3. **Repository Pattern / Abstraction**: Refactor direct `prisma` calls in API routes and Server Actions into a data access layer or service wrapper. 
   ```typescript
   // src/lib/db-access.ts
   import { prisma } from '@/lib/prisma';
   import { mockDb } from '@/lib/mock-db';
   
   export const getJobs = async () => {
     if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') return mockDb.job.findMany();
     return prisma.job.findMany();
   };
   ```
4. **Mock Implementation**: Implement an in-memory store (singleton) for the mock DB to persist state during the session (e.g., creating a job in mock mode should show up in the list until refresh).
5. **Script Update**: Add `npm run dev:mock` to `package.json` that sets the environment variable before starting Next.js.

**Test Strategy:**

1. **Environment Isolation**: Stop all local database containers (PostgreSQL/Redis).
2. **Startup Verification**: Run `npm run dev:mock` and verify the application starts without connection errors.
3. **Navigation Check**: Navigate to `/settings` (Task 21) and verify that configuration data loads from the mock source.
4. **Interaction Test**: Perform a 'write' operation (e.g., update a setting) in mock mode and verify the UI reflects the change immediately (in-memory persistence).
5. **Build Verification**: Run `npm run build` with mock mode enabled to ensure CI pipelines can pass without a live database.
