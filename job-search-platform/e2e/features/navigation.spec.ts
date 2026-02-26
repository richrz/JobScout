import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  // Ensure we are in desktop view so sidebar is visible
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('should navigate to major routes from sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Check Dashboard
    await expect(page).toHaveTitle(/JobScout/);
    
    // Navigate to Inbox (which goes to /jobs)
    await page.getByRole('link', { name: /Inbox/i }).click();
    await expect(page).toHaveURL(/\/jobs/);
    
    // Navigate to Pipeline
    await page.getByRole('link', { name: /Pipeline/i }).click();
    await expect(page).toHaveURL(/\/pipeline/);
    
    // Navigate to Settings
    await page.getByRole('link', { name: /Settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
