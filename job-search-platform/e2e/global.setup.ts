import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/dev-user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to sign-in page
  await page.goto('/auth/signin');
  
  // Fill in credentials from seed
  await page.getByPlaceholder(/email/i).fill('demo@example.com');
  await page.getByPlaceholder(/password/i).fill('password123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard/home
  await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('dashboard'), { timeout: 15000 });
  
  // Verify dashboard loaded
  await expect(page.getByText(/Dashboard|JobScout|Workspace/i).first()).toBeVisible();

  // Save storage state
  await page.context().storageState({ path: authFile });
});
