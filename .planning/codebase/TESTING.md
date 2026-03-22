# Testing Conventions

## Testing Stack

- **Unit/Integration**: Jest 30 with ts-jest
- **E2E**: Playwright 1.58
- **Test Environment**: Node.js (for unit tests), Chromium/Firefox/WebKit (for E2E)
- **Assertion Library**: Jest built-in matchers + Testing Library

## Configuration

### Jest Setup

**File**: `jest.config.js`

```javascript
const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Key Points**:
- Node.js test environment (not jsdom) for backend tests
- Path alias `@/` mapped to `src/`
- ts-jest handles TypeScript compilation

### Playwright Setup

**Command**: `npm run test:e2e`

**Variants**:
- `npm run test:e2e:smoke` - Smoke tests only
- `npm run test:e2e:ui` - Interactive UI mode

## Test File Organization

### Location & Naming

**Unit/Integration Tests**:
```
src/lib/validations/__tests__/config.test.ts
src/lib/validations/__tests__/[module].test.ts
```

**Pattern**:
- Tests colocated in `__tests__/` subdirectory near source
- File naming: `[module].test.ts` or `[module].spec.ts`
- One test file per module

**E2E Tests**:
```
e2e/
├── auth.spec.ts
├── jobs.spec.ts
└── pipeline.spec.ts
```

## Unit Test Patterns

### Validation Schema Tests

**File**: `src/lib/validations/__tests__/config.test.ts`

**Pattern**:
```typescript
import { configSchema, citySchema } from '../config';

describe('Config Validation Schemas', () => {
    describe('citySchema', () => {
        it('validates a correct city object', () => {
            const validCity = { name: 'Austin', radius_miles: 20, weight: 50 };
            expect(citySchema.parse(validCity)).toEqual(validCity);
        });

        it('rejects invalid radius defined in schema', () => {
            const invalidCity = { name: 'Austin', radius_miles: 1, weight: 50 };
            expect(() => citySchema.parse(invalidCity)).toThrow();
        });

        it('rejects invalid weight defined in schema', () => {
            const invalidCity = { name: 'Austin', radius_miles: 20, weight: 150 };
            expect(() => citySchema.parse(invalidCity)).toThrow();
        });
    });

    describe('configSchema (Import/Export)', () => {
        const validConfig = {
            cities: [{ name: 'Austin', radius_miles: 20, weight: 50 }],
            categories: ['Developer'],
            include_keywords: ['React'],
            exclude_keywords: ['Java'],
            salary_usd: { min: 100000, max: 200000 },
            posted_within_hours: 48
        };

        it('validates a complete configuration object', () => {
            expect(configSchema.parse(validConfig)).toEqual(validConfig);
        });

        it('validates salary range structure', () => {
            const configWithSalary = { ...validConfig, salary_usd: { min: 50000 } };
            expect(configSchema.parse(configWithSalary).salary_usd).toEqual({ min: 50000 });
        });
    });
});
```

**Key Patterns**:
- `describe()` blocks organize related tests
- `it()` for individual test cases
- Test both valid and invalid inputs
- Use `.toThrow()` for error cases
- Use `.toEqual()` for value comparison

### Service Tests

**Pattern** (not yet implemented, but recommended):
```typescript
import { saveJobs } from '@/lib/job-service';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('Job Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveJobs', () => {
    it('saves new jobs to database', async () => {
      const jobs = [
        {
          title: 'React Developer',
          company: 'Acme Corp',
          sourceUrl: 'https://example.com/job/1',
          // ... other fields
        }
      ];

      (prisma.job.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.job.create as jest.Mock).mockResolvedValue({ id: '1', ...jobs[0] });

      await saveJobs(jobs);

      expect(prisma.job.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'React Developer',
          company: 'Acme Corp'
        })
      });
    });

    it('updates existing jobs by sourceUrl', async () => {
      const existingJob = { id: '1', sourceUrl: 'https://example.com/job/1' };
      const updatedJob = { ...existingJob, title: 'Senior React Developer' };

      (prisma.job.findUnique as jest.Mock).mockResolvedValue(existingJob);
      (prisma.job.update as jest.Mock).mockResolvedValue(updatedJob);

      await saveJobs([updatedJob]);

      expect(prisma.job.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.any(Object)
      });
    });
  });
});
```

## Mocking Patterns

### Prisma Mocking

**Pattern**:
```typescript
jest.mock('@/lib/prisma');

// In test
(prisma.job.findMany as jest.Mock).mockResolvedValue([
  { id: '1', title: 'Job 1' },
  { id: '2', title: 'Job 2' }
]);

// Verify calls
expect(prisma.job.findMany).toHaveBeenCalledWith({
  where: { /* ... */ },
  take: 50
});
```

### External Service Mocking

**Pattern**:
```typescript
jest.mock('@/lib/cts/talent-service');

(searchJobs as jest.Mock).mockResolvedValue({
  jobs: [{ postgresJobId: '1', title: 'Job 1', matchScore: 0.95 }],
  totalSize: 1,
  nextPageToken: null
});
```

### Environment Variable Mocking

**Pattern**:
```typescript
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
});

afterEach(() => {
  delete process.env.DATABASE_URL;
});
```

## Component Testing

### React Component Tests (Recommended Pattern)

**Not yet implemented, but recommended approach**:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobCard } from '@/components/jobs/JobCard';

describe('JobCard Component', () => {
  const mockJob = {
    id: '1',
    title: 'React Developer',
    company: 'Acme Corp',
    location: 'Austin, TX',
    description: 'Build amazing things',
    compositeScore: 0.85,
    // ... other fields
  };

  it('renders job information', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('React Developer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('displays score as percentage', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('calls onToggleSelection when interest button clicked', async () => {
    const onToggleSelection = jest.fn();
    render(
      <JobCard
        job={mockJob}
        onToggleSelection={onToggleSelection}
        selectionMode={true}
      />
    );

    const button = screen.getByRole('button', { name: /interested/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onToggleSelection).toHaveBeenCalledWith('1');
    });
  });

  it('shows error message on action failure', async () => {
    const { rerender } = render(<JobCard job={mockJob} />);

    // Simulate error state
    rerender(<JobCard job={mockJob} />);

    // Error would be displayed via state management
  });
});
```

**Key Patterns**:
- Use `render()` from Testing Library
- Query elements with semantic queries: `getByRole()`, `getByText()`, `getByLabelText()`
- Use `fireEvent` or `userEvent` for interactions
- Use `waitFor()` for async operations
- Mock server actions/API calls

## API Route Testing

### Recommended Pattern

```typescript
import { GET, POST } from '@/app/api/jobs/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma');
jest.mock('@/lib/cache');

describe('GET /api/jobs', () => {
  it('returns paginated jobs', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/jobs?page=1&limit=50')
    );

    (prisma.job.findMany as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Job 1' }
    ]);
    (prisma.job.count as jest.Mock).mockResolvedValue(1);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jobs).toHaveLength(1);
    expect(data.pagination.page).toBe(1);
  });

  it('returns 500 on database error', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/jobs')
    );

    (prisma.job.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Failed to fetch jobs'
    });
  });
});
```

## E2E Testing

### Playwright Setup

**File**: `playwright.config.ts` (recommended)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.smoke.spec.ts',
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Job Search', () => {
  test('user can search for jobs', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]');

    // Verify jobs are displayed
    const jobCards = await page.locator('[data-testid="job-card"]').count();
    expect(jobCards).toBeGreaterThan(0);
  });

  test('user can filter jobs by location', async ({ page }) => {
    await page.goto('/jobs');

    // Enter search query
    await page.fill('[data-testid="search-input"]', 'Austin');
    await page.click('[data-testid="search-button"]');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="job-card"]');

    // Verify results contain location
    const firstCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstCard).toContainText('Austin');
  });

  test('user can apply to a job', async ({ page }) => {
    await page.goto('/jobs');

    // Click on first job
    await page.click('[data-testid="job-card"]');

    // Click apply button
    await page.click('[data-testid="apply-button"]');

    // Verify success message
    await expect(page.locator('text=Applied successfully')).toBeVisible();
  });
});
```

**Key Patterns**:
- Use `test.describe()` for test suites
- Use `test()` for individual tests
- Use `page.goto()` for navigation
- Use `page.fill()`, `page.click()` for interactions
- Use `page.waitForSelector()` for async operations
- Use `expect()` for assertions
- Use `[data-testid]` attributes for reliable element selection

## Test Data & Fixtures

### Seed Data

**Pattern** (recommended):
```typescript
// tests/fixtures/jobs.ts
export const mockJobs = [
  {
    id: '1',
    title: 'React Developer',
    company: 'Acme Corp',
    location: 'Austin, TX',
    description: 'Build amazing things',
    salary: '$100k - $150k',
    postedAt: new Date('2024-01-01'),
    compositeScore: 0.85,
    // ... other fields
  },
  // ... more jobs
];

// In test
import { mockJobs } from '@/tests/fixtures/jobs';

(prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);
```

### Factory Functions

**Pattern** (recommended):
```typescript
// tests/factories/job.ts
export function createJob(overrides?: Partial<Job>): Job {
  return {
    id: '1',
    title: 'React Developer',
    company: 'Acme Corp',
    location: 'Austin, TX',
    description: 'Build amazing things',
    salary: '$100k - $150k',
    postedAt: new Date(),
    compositeScore: 0.85,
    ...overrides,
  };
}

// In test
const job = createJob({ title: 'Senior React Developer' });
```

## Coverage

### Current State

- **Unit Tests**: Minimal (only validation schemas tested)
- **Integration Tests**: None
- **E2E Tests**: Smoke tests available
- **Coverage Target**: Not specified

### Recommended Coverage Goals

- **Utilities/Services**: 80%+ coverage
- **API Routes**: 70%+ coverage
- **Components**: 60%+ coverage (focus on critical paths)
- **Critical Paths**: 100% coverage (auth, payments, data mutations)

## Running Tests

### Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run smoke tests only
npm run test:e2e:smoke

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### CI/CD Integration

**Recommended GitHub Actions workflow**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Do's

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests focused and isolated
- ✅ Mock external dependencies
- ✅ Use fixtures for common test data
- ✅ Test error cases and edge cases
- ✅ Use semantic queries in component tests
- ✅ Clean up after tests (beforeEach/afterEach)

### Don'ts

- ❌ Don't test implementation details
- ❌ Don't create interdependent tests
- ❌ Don't use generic test names like "works" or "test"
- ❌ Don't test third-party libraries
- ❌ Don't skip error handling tests
- ❌ Don't use `setTimeout` for async operations (use `waitFor`)
- ❌ Don't commit `.only` or `.skip` in tests

## Debugging Tests

### Jest Debugging

```bash
# Run single test file
npm test -- config.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="validates"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

```bash
# Debug mode with inspector
npx playwright test --debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Future Improvements

1. **Increase Unit Test Coverage**: Target 80%+ for services and utilities
2. **Add Component Tests**: Use Testing Library for React components
3. **Add Integration Tests**: Test API routes with real database
4. **Add Performance Tests**: Monitor query performance and bundle size
5. **Add Visual Regression Tests**: Catch unintended UI changes
6. **Set Up Coverage Thresholds**: Enforce minimum coverage in CI
7. **Add Accessibility Tests**: Use axe-core for a11y testing
