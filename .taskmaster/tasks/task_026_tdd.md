# Task ID: 26

**Title:** Implement End-to-End Testing Suite with Playwright

**Status:** pending

**Dependencies:** 22 ✓, 24, 25

**Priority:** high

**Description:** Set up and configure Playwright to run browser-based E2E tests verifying application startup, core route navigation, authentication flows, and UI interactivity like theme toggling.

**Details:**

1. **Installation & Configuration**: Initialize Playwright (`npm init playwright@latest`). Configure `playwright.config.ts` to support multiple browsers (Chromium, Firefox, Webkit) and set the `webServer` command to run the Next.js app in Mock Mode (leveraging Task 25).
2. **Test Environment Setup**: Ensure tests run against `NEXT_PUBLIC_MOCK_MODE=true` to avoid database dependencies during CI execution. Create a `global-setup.ts` if necessary to seed mock state.
3. **Core Specs Implementation**:
   - `specs/navigation.spec.ts`: Verify navigation to `/dashboard`, `/jobs`, and `/settings` (Task 24) results in HTTP 200 and correct page headers.
   - `specs/theme.spec.ts`: Locate the theme toggle button (Task 22), click it, and assert that the `<html>` class attribute switches between 'light' and 'dark'.
   - `specs/auth.spec.ts`: Specific test for the login form submission and redirection logic.
4. **CI Integration**: Add scripts to `package.json` (`test:e2e`, `test:e2e:ui`) and ensure HTML reports are generated.

**Test Strategy:**

1. **Local Execution**: Run `npm run test:e2e` and confirm all tests pass in headless mode.
2. **Visual Verification**: Run `npx playwright test --ui` to visually inspect the browser interactions during test execution.
3. **Theme Logic**: Specifically verify that the theme toggle test fails if the class name does not update on the `html` element.
4. **Mock Integration**: Confirm tests pass without a running PostgreSQL container, validating the integration with Task 25.
