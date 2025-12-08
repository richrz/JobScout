# Task ID: 12

**Title:** Design and Implement Prisma Database Schema with Migrations

**Status:** done

**Dependencies:** 11 ✓

**Priority:** high

**Description:** Create the complete Prisma schema matching the PRD specifications (User, Profile, Job, Application, Config models) and set up initial database migrations with proper indexes and relationships.

**Details:**

1. Initialize Prisma:
   ```bash
   npx prisma init
   ```

2. Create schema.prisma with exact models from PRD:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model User {
     id            String        @id @default(cuid())
     email         String        @unique
     name          String?
     createdAt     DateTime      @default(now())
     updatedAt     DateTime      @updatedAt
     profile       Profile?
     applications  Application[]
     config        Config?
     @@index([email])
   }

   model Profile {
     id              String   @id @default(cuid())
     userId          String   @unique
     user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     contactInfo     Json
     workHistory     Json[]
     education       Json[]
     skills          String[]
     projects        Json[]
     certifications  Json[]
     preferences     Json
     completeness    Int      @default(0)
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
   }

   model Job {
     id              String        @id @default(cuid())
     title           String
     company         String
     location        String
     latitude        Float?
     longitude       Float?
     description     String        @db.Text
     salary          String?
     postedAt        DateTime
     source          String
     sourceUrl       String
     cityMatch       String?
     distanceMiles   Float?
     compositeScore  Float?
     createdAt       DateTime      @default(now())
     applications    Application[]
     @@index([postedAt, source])
     @@index([cityMatch, compositeScore])
   }

   model Application {
     id            String    @id @default(cuid())
     userId        String
     user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
     jobId         String
     job           Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
     status        String    @default("discovered")
     resumePath    String?
     notes         String?   @db.Text
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
     appliedAt     DateTime?
     statusHistory Json[]
     @@index([userId, status])
     @@index([jobId])
   }

   model Config {
     id            String   @id @default(cuid())
     userId        String   @unique
     user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     searchParams  Json
     llmConfig     Json
     dailyCaps     Json
     fileNaming    String   @default("YYYY-MM-DD - {company} - {role}.pdf")
     version       String   @default("1.0")
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
   }
   ```

3. Generate and run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Create seed script (prisma/seed.ts) for development data
5. Set up Prisma Client singleton pattern in src/lib/prisma.ts

**Test Strategy:**

1. Run migration successfully: `npx prisma migrate dev`
2. Verify all tables created in PostgreSQL: `npx prisma studio`
3. Test CRUD operations for each model using Prisma Client
4. Validate relationships work (cascade deletes, foreign keys)
5. Check indexes are created: Query PostgreSQL system tables
6. Run seed script and verify data: `npx prisma db seed`
7. Test schema validation with invalid data (should fail gracefully)

## Subtasks

### 12.1. Design Prisma Schema with Complete Model Relationships

**Status:** done  
**Dependencies:** None  

Implement the complete Prisma schema with all required models and properly configured relationships including cascade deletes

**Details:**

Create schema.prisma file with User, Profile, Job, Application, and Config models from PRD specifications. Configure all relationships with proper onDelete actions (Cascade, SetNull). Ensure required fields, constraints, and data types match requirements. Pay special attention to one-to-one (User-Profile, User-Config) and one-to-many (User-Application, Job-Application) relationships. Validate JSON field usage for complex data structures.
<info added on 2025-11-19T17:32:45.871Z>
Plan:
1. Initialize Prisma in the project: cd job-search-platform && npx prisma init
2. Create tests/verify_prisma_schema.js to parse job-search-platform/prisma/schema.prisma and verify:
    - Models: User, Profile, Job, Application, Config exist.
    - User model has email, profile, applications, config.
    - Profile model has userId relation.
    - Job model has applications.
    - Application model has userId, jobId.
    - Config model has userId, searchParams.
3. Run verification (expect failure).
4. Update job-search-platform/prisma/schema.prisma with the complete schema definition from the task details.
5. Run verification (expect success).
</info added on 2025-11-19T17:32:45.871Z>

### 12.2. Implement Strategic Indexing for Query Performance

**Status:** done  
**Dependencies:** 12.1  

Analyze query patterns and implement optimized indexing strategy across all database models

**Details:**

Review expected query patterns from application requirements. Add indexes for foreign keys, unique fields, and frequently queried columns. Implement composite indexes where needed (e.g., [userId, status] for Application model, [postedAt, source] for Job model). Validate index strategy against expected query patterns. Document rationale for each index. Ensure all specified indexes from PRD are correctly implemented.
<info added on 2025-11-19T17:40:22.213Z>
Plan:
1. Create `tests/verify_indexes.js` to parse `job-search-platform/prisma/schema.prisma` and verify specific indexes:
    - User: `@@index([email])`
    - Job: `@@index([postedAt, source])`, `@@index([cityMatch, compositeScore])`
    - Application: `@@index([userId, status])`, `@@index([jobId])`
2. Run verification (expect success, as indexes were added in previous step).
3. If success, we will double-check if any additional indexes from the plan are missing.
4. Run verification (expect success).
</info added on 2025-11-19T17:40:22.213Z>

### 12.3. Configure Prisma Migration Workflow with Seed Data

**Status:** done  
**Dependencies:** 12.1, 12.2  

Set up complete Prisma migration process including initial migration, seed script, and validation procedures

**Details:**

Create initial migration using 'prisma migrate dev --name init'. Implement seed script (prisma/seed.ts) with realistic development data for all models. Configure migration workflow according to best practices (using prisma db push vs prisma migrate). Set up proper environment variables and connection pooling configuration. Include validation steps to ensure migrations apply correctly across environments.
<info added on 2025-11-19T17:41:35.029Z>
Plan:
1. Create tests/verify_seed.js to check for existence of job-search-platform/prisma/seed.ts and verify it contains seeding logic for at least one user/job.
2. Run verification (expect failure).
3. Create job-search-platform/prisma/seed.ts with realistic mock data for users, jobs, and config.
4. Configure package.json to add prisma seed command.
5. Run verification (expect success).
</info added on 2025-11-19T17:41:35.029Z>

### 12.4. Implement Prisma Client Singleton Pattern with Connection Management

**Status:** done  
**Dependencies:** 12.3  

Set up Prisma Client with proper singleton pattern and connection management for production use

**Details:**

Create Prisma Client singleton in src/lib/prisma.ts to prevent multiple instances in development. Configure connection pool settings appropriate for production environment (max connections, timeout). Implement proper error handling and logging. Set up query logging configuration for different environments (development vs production). Include SSL configuration for secure database connections.
<info added on 2025-11-19T17:45:20.431Z>
Plan:
1. Create tests/verify_prisma_client.js to check for job-search-platform/src/lib/prisma.ts.
2. Run verification (expect failure).
3. Create job-search-platform/src/lib/prisma.ts implementing the singleton pattern for Prisma Client.
4. Run verification (expect success).
</info added on 2025-11-19T17:45:20.431Z>
