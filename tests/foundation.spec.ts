import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
});

test('login with a demo account redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Priya Nair/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /Welcome back, Priya/i })).toBeVisible();
});

test('dashboard renders KPI widgets and quick actions', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Aarav Shah/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await expect(page.getByText('128')).toBeVisible();
  await expect(page.getByText('Documents', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ask Buddy AI/i })).toBeVisible();
  await expect(page.getByText('Recent Activity')).toBeVisible();
});

test('employee role hides Employees and Reports nav items', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Simran Kaur/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  const sidebar = page.locator('[data-slot="sidebar"]');
  await expect(sidebar.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Employees' })).toHaveCount(0);
  await expect(sidebar.getByRole('link', { name: 'Reports' })).toHaveCount(0);
});

test('super admin role sees Employees and Reports nav items', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Aarav Shah/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  const sidebar = page.locator('[data-slot="sidebar"]');
  await expect(sidebar.getByRole('link', { name: 'Employees' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Reports' })).toBeVisible();
});

test('settings page toggles dark mode', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Aarav Shah/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await page.goto('/settings');

  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('unauthenticated visitor is redirected away from dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
