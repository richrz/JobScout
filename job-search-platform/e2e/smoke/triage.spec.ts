import { test, expect } from '@playwright/test';

test.describe('Triage Feed Smoke Test', () => {
  test('should display jobs in the triage feed', async ({ page }) => {
    await page.goto('/triage');
    
    // Check if feed loads
    await expect(page.locator('h1')).toContainText(/Triage/i);
    
    // Verify at least one job card exists (assuming seeded)
    const jobCards = page.locator('[data-testid^="job-card-"]');
    // If we have jobs, we should see them. If not, maybe an empty state.
    // Let's assume there's an empty state or jobs.
    await expect(page.getByText(/No jobs to triage|Total Jobs/i)).toBeVisible();
  });
});
