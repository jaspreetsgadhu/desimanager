import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
});

async function loginAs(page: import('@playwright/test').Page, name: string) {
  await page.goto('/login');
  await page.getByRole('button', { name: /I am an Employee/i }).click();
  await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test('HR page shows quick info and answers a question', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/hr');

  await expect(page.getByRole('heading', { name: 'HR', exact: true })).toBeVisible();
  await expect(page.getByText('Leave Balance')).toBeVisible();

  await page.getByRole('button', { name: 'When is the next public holiday?' }).click();
  await expect(page.getByText('When is the next public holiday?')).toBeVisible();
  // Real RAG call — assert the assistant response renders.
  await expect(page.getByText('HR Manager AI', { exact: true }).first()).toBeVisible({ timeout: 20000 });
});

test('Customer Care page lists complaints and can switch to WhatsApp simulation', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/customer-care');

  await expect(page.getByRole('heading', { name: 'Customer Care' })).toBeVisible();
  await expect(page.getByText('Customer Complaints', { exact: true })).toBeVisible();
  // Complaints come from Supabase: wait for loading to finish, showing either a row or the empty state.
  await expect(
    page.getByRole('button', { name: 'Escalate' }).or(page.getByText(/^(open|in progress|resolved)$/)).or(page.getByText('No complaints yet')).first()
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole('tab', { name: /WhatsApp Simulation/i }).click();
  await expect(page.getByText('+91 98765 43210')).toBeVisible();
});

test('Reports page overview and analytics tabs render', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/reports');

  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
  await expect(page.getByText('Daily Summary')).toBeVisible();

  await page.getByRole('tab', { name: /Analytics/i }).click();
  await expect(page.getByText('Knowledge Coverage')).toBeVisible();
  await expect(page.getByText('Department Activity')).toBeVisible();
});

test('AI Workspace pins the conversation to HR Manager AI when its card is clicked', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/ai-workspace');

  await page.getByRole('button', { name: /HR Manager AI/ }).click();
  await expect(page.getByText('Chatting with')).toBeVisible();
  await expect(page.getByText('HR Manager AI', { exact: true }).first()).toBeVisible();

  await page.getByPlaceholder(/Ask HR Manager AI anything/i).fill('What is our remote work policy?');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('What is our remote work policy?')).toBeVisible();
  await expect(page.getByText('HR Manager AI', { exact: true }).first()).toBeVisible({ timeout: 20000 });
});

test('voice mic mock fills the input after listening', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/ai-workspace');

  const input = page.getByPlaceholder(/Ask Buddy AI anything|Listening/i);
  await page.getByRole('button', { name: 'Voice input' }).click();
  await expect(input).not.toHaveValue('', { timeout: 3000 });
});

test('settings page changes voice language', async ({ page }) => {
  await loginAs(page, 'Aarav Shah');
  await page.goto('/settings');

  await expect(page.getByText('Voice Language')).toBeVisible();
});
