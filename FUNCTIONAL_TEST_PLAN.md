# JobScout Functional Test Plan

**Status:** Active Working Plan  
**Purpose:** End-to-end verification strategy and manual demo expectations

This document outlines the End-to-End (E2E) testing strategy for JobScout using Playwright.

> [!IMPORTANT]  
> **Verification Rule:** No test is considered "done" until the user can manually click through the flow to verify it.  
> Every automated test (`.spec.ts`) MUST have a corresponding `npm run demo:manual:...` script that guides the user through the same steps.

## Current Setup

### Infrastructure

- **Framework**: Playwright
- **Storage**: Auth states are persisted in `playwright/.auth/` to avoid redundant logins.
- **Port**: Tests run on `http://localhost:3173` (enforced during test runs).
- **Mock Mode**: Tests are currently verified with `NEXT_PUBLIC_MOCK_MODE=true`.

### Automated Tests

1. **Authentication Setup (`e2e/global.setup.ts`)**
   - Logs in using `demo@example.com`.
   - Verifies dashboard arrival.
   - Saves session state.

2. **Navigation Smoke Test (`e2e/features/navigation.spec.ts`)**
   - Verifies sidebar links: Inbox, Pipeline, Settings.
   - _Status: Troubleshooting Pipeline link visibility._

3. **Triage Feed Smoke Test (`e2e/smoke/triage.spec.ts`)**
   - Verifies triage feed loading.

## Running Tests

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run all tests
npm run test:e2e

# Run only smoke tests
npm run test:e2e:smoke

# Run with UI for debugging
npm run test:e2e:ui
```

## Next Steps

- [ ] Stabilize Pipeline navigation test (resolve element visibility issue).
- [ ] Add Resume Generation smoke test.
- [ ] Add Map Interface smoke test.
- [ ] Integrate into CI pipeline.
