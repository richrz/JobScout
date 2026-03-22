# Codebase Conventions

## Language & Tooling

- **Language**: TypeScript (strict mode enabled)
- **Framework**: Next.js 16 with App Router
- **Package Manager**: npm
- **Linting**: ESLint 9 with Next.js config (core-web-vitals + typescript)
- **Type Checking**: TypeScript 5 with strict compiler options

## File Organization

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers (route.ts)
│   ├── actions/           # Server actions (use 'use server')
│   ├── auth/              # Authentication pages
│   └── [page]/page.tsx    # Page components
├── components/            # React components organized by feature
│   ├── ui/               # Reusable UI primitives (Radix UI based)
│   ├── jobs/             # Job-related components
│   ├── pipeline/         # Pipeline UI components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utility functions and services
│   ├── validations/      # Zod schemas with __tests__ subdirectory
│   ├── cts/              # Cloud Talent Solution integration
│   ├── ingest/           # Data ingestion utilities
│   ├── resume/           # Resume generation and parsing
│   ├── opportunities/    # Opportunity state management
│   ├── workspace/        # Workspace utilities
│   ├── simulation/       # Simulation utilities
│   └── [service].ts      # Service modules (auth, cache, llm, etc.)
└── types/                # TypeScript type definitions
```

### Naming Conventions

**Files**:
- Components: PascalCase (e.g., `JobCard.tsx`, `InboxGrid.tsx`)
- Services/utilities: kebab-case (e.g., `job-service.ts`, `error-reporting.ts`)
- API routes: `route.ts` (Next.js convention)
- Tests: `__tests__/` subdirectory with `.test.ts` or `.spec.ts` suffix

**Exports**:
- Named exports for utilities and services
- Default exports for React components (optional but common)
- Type exports use `export type` keyword

**Variables & Functions**:
- camelCase for variables and functions
- UPPER_SNAKE_CASE for constants (e.g., `DEFAULT_MODELS`, `CacheKeys`)
- Prefix private methods with underscore (e.g., `_validateConfig`)

## Code Style

### TypeScript

**Strict Mode**:
- `strict: true` enforced in tsconfig.json
- All types must be explicit; no implicit `any`
- Null/undefined handling required

**Type Definitions**:
```typescript
// Prefer explicit types over inference
interface JobCardProps {
  job: Job;
  initialStatus?: string | null;
  isSelected?: boolean;
}

// Use type unions for discriminated unions
type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter' | 'azure' | 'custom';

// Generic constraints for reusable utilities
async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds?: number
): Promise<T>
```

**Imports**:
- Path alias `@/` maps to `src/` (configured in tsconfig.json)
- Group imports: React/Next → external packages → internal modules
- Use named imports for clarity

```typescript
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache, CacheKeys } from "@/lib/cache";
```

### React Components

**Functional Components**:
- All components are functional (no class components)
- Use `"use client"` directive for client-side interactivity
- Use `"use server"` directive for server actions

**Props Pattern**:
```typescript
interface ComponentProps {
  // Required props first
  job: Job;
  // Optional props with defaults
  isSelected?: boolean;
  onToggleSelection?: (jobId: string) => void;
}

export function JobCard({ job, isSelected = false, onToggleSelection }: ComponentProps) {
  // Component body
}
```

**State Management**:
- `useState` for local component state
- Server actions for mutations
- React Query patterns not observed; direct API calls with error handling

**Hooks**:
- `useRouter` from `next/navigation` for client-side navigation
- `useSession` from `next-auth/react` for auth state
- Custom hooks follow `use*` naming convention

### API Routes

**Structure**:
```typescript
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    // Business logic
    const result = await fetchData();

    // Return response
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Process data
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**Dynamic Routes**:
- Use `export const dynamic = 'force-dynamic'` to disable caching when needed
- Revalidate cache with `revalidatePath()` after mutations

### Server Actions

**Pattern**:
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateApplicationStatus(id: string, newStatus: string) {
  try {
    const result = await prisma.application.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath('/applications');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

**Return Pattern**:
- Return object with `success` boolean and `data` or `error` field
- Clients check `result.success` before accessing data

## Error Handling

### API Routes & Server Actions

**Pattern**:
```typescript
try {
  // Business logic
  const result = await operation();
  return NextResponse.json(result);
} catch (error) {
  console.error("Context: Error message", error);
  return NextResponse.json(
    { error: "User-friendly message" },
    { status: 500 }
  );
}
```

**Error Reporting**:
- Use `console.error()` with context for logging
- `sendErrorReport()` utility available for structured error reporting
- No external error tracking (Sentry) currently integrated

### Client-Side Error Handling

**Pattern**:
```typescript
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null);
  try {
    const result = await serverAction();
    if (result.success) {
      // Handle success
    } else {
      setError(result.error || 'Operation failed');
    }
  } catch {
    setError('Operation failed');
  }
};
```

**Special Cases**:
- Unauthorized errors trigger redirect to `/auth/signin`
- Network errors caught in catch block
- User-facing error messages stored in state

## Data Validation

### Zod Schemas

**Location**: `src/lib/validations/`

**Pattern**:
```typescript
import { z } from 'zod';

export const citySchema = z.object({
  name: z.string().min(1, 'City name required'),
  radius_miles: z.number().min(5).max(100),
  weight: z.number().min(0).max(100)
});

export const configSchema = z.object({
  cities: z.array(citySchema),
  categories: z.array(z.string()).min(1),
  salary_usd: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  })
});
```

**Usage**:
```typescript
try {
  const validated = configSchema.parse(data);
} catch (error) {
  // Handle validation error
}
```

## Database

### Prisma ORM

**Patterns**:
- Import `prisma` from `@/lib/prisma`
- Use typed queries with `include` and `select` for relations
- Upsert pattern: check existence → update or create

**Upsert Strategy** (from job-service.ts):
1. Check by unique constraint (e.g., `sourceUrl`)
2. If not found, check by fingerprint for cross-source dedup
3. If neither exists, insert new record

**Transactions**:
- Use `prisma.$transaction()` for multi-step operations
- Automatic rollback on error

## Caching

### In-Memory Cache

**Pattern**:
```typescript
const cacheKey = CacheKeys.jobList(page, query);
const result = await cache.getOrSet(
  cacheKey,
  async () => {
    // Fetch from DB
    return data;
  },
  300 // TTL in seconds
);
```

**Cache Keys**:
- Defined in `CacheKeys` object with factory functions
- Prefix-based pattern matching for invalidation

## Authentication

### NextAuth.js

**Configuration**:
- JWT session strategy with 30-day max age
- Providers: Google OAuth + Credentials (dev bypass)
- Adapter: Prisma

**Dev Bypass**:
```typescript
if (
  process.env.NODE_ENV !== "production" &&
  credentials.email === "dev@localhost" &&
  credentials.password === "devpass123"
) {
  return { id: "...", email: "...", name: "..." };
}
```

**Session Access**:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
```

## UI Components

### Radix UI + Tailwind CSS

**Component Library**:
- Radix UI primitives for accessibility
- Mantine for higher-level components
- Custom UI components in `src/components/ui/`

**Styling**:
- Tailwind CSS for utility classes
- `clsx` or `cn()` for conditional classes
- Dark mode support via `next-themes`

**Pattern**:
```typescript
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function JobCard({ job, isSelected }) {
  return (
    <div className={cn("p-4", isSelected && "ring-2 ring-blue-500")}>
      <h3>{job.title}</h3>
      <Badge>{job.company}</Badge>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

## External Services

### LLM Integration

**Pattern**:
- Abstract base class `BaseLLMClient` with provider implementations
- Supports: OpenAI, Anthropic, Google Generative AI, Ollama, OpenRouter, Azure
- Configuration validation before use

**Usage**:
```typescript
const client = createLLMClient(config);
const response = await client.generateResponse(messages);
const stream = await client.generateStreamResponse(messages);
```

### Cloud Talent Solution (CTS)

**Pattern**:
- Dual-write: Postgres (source of truth) + CTS (search index)
- Best-effort CTS sync; failures don't block Postgres writes
- Fallback to Postgres ILIKE search if CTS unavailable

## Comments & Documentation

**JSDoc**:
```typescript
/**
 * Save jobs to the database with optional CTS sync.
 * @param jobs Array of job listings to save
 * @returns void
 */
export async function saveJobs(jobs: JobListing[]): Promise<void> {
  // Implementation
}
```

**Inline Comments**:
- Explain "why" not "what"
- Use for complex logic or non-obvious decisions
- Prefix with `//` for single line, `/* */` for multi-line

**Section Comments**:
```typescript
// ── Path 1: sourceUrl already exists → refresh ────────────────────────────
const byUrl = await prisma.job.findUnique({ where: { sourceUrl } });
```

## Environment Variables

**Pattern**:
- Prefix public vars with `NEXT_PUBLIC_`
- Load root env with `import '@/lib/load-root-env'` in server files
- Type-safe access via `process.env.VAR_NAME`

**Common Vars**:
- `NODE_ENV`: 'development' | 'production'
- `NEXT_PUBLIC_MOCK_MODE`: Enable mock data
- `DATABASE_URL`: Postgres connection
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: LLM providers

## Performance Considerations

**Caching**:
- Job lists cached for 5 minutes (300s)
- Cache invalidated on mutations via `revalidatePath()`

**Database**:
- Use `select` to fetch only needed fields
- Use `include` for relations
- Batch operations with `Promise.all()`

**Pagination**:
- Default limit: 50 items
- Offset-based for Postgres, token-based for CTS

## Accessibility

**UI Components**:
- Radix UI provides semantic HTML and ARIA attributes
- Use `<label>` with form inputs
- Keyboard navigation support built-in

**Color & Contrast**:
- Tailwind CSS color palette used consistently
- Dark mode support via CSS variables

## Testing Patterns

See TESTING.md for comprehensive testing conventions.
