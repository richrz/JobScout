import { defineConfig, devices } from '@playwright/test';

/**
 * JobScout E2E Testing Configuration
 * 
 * Run smoke tests: npm run test:e2e:smoke
 * Run all tests: npm run test:e2e
 * Run with UI: npm run test:e2e:ui
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3173',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs once to authenticate
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    
    // Smoke tests - critical path, must pass before any PR
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/dev-user.json',
      },
    },
    
    // Feature tests - full test suite
    {
      name: 'features',
      testMatch: /features\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/dev-user.json',
      },
    },
    
    // Unauthenticated tests - for testing login flow
    {
      name: 'auth-tests',
      testMatch: /smoke\/auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // No storageState - tests run unauthenticated
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
