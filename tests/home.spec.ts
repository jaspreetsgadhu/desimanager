import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Desi Manager/);
  await expect(page.getByRole('heading', { name: /Reduce manpower dependency/i })).toBeVisible();
});
