import { test, expect } from '@playwright/test';

test.describe('KIVO System E2E Smoke Tests', () => {
  test('web application entrypoint renders successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page title and brand heading
    await expect(page).toHaveTitle(/KIVO/i);
    const heading = page.getByRole('heading', { level: 1, name: 'KIVO' });
    await expect(heading).toBeVisible();

    // Verify application foundation initialized
    const statusText = page.getByTestId('app-status');
    await expect(statusText).toHaveText('Status: Initialized');
  });

  test('backend API health check responds and proxies correctly', async ({ request }) => {
    // Probe direct API health
    const apiResponse = await request.get('http://localhost:3000/api/v1/health');
    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();
    expect(apiData.status).toBe('ok');
    expect(apiData.service).toBe('kivo-api');
    expect(apiData.database).toBe('connected');

    // Probe Vite dev server reverse-proxy to API
    const proxyResponse = await request.get('/api/v1/health');
    expect(proxyResponse.ok()).toBeTruthy();
    const proxyData = await proxyResponse.json();
    expect(proxyData.status).toBe('ok');
    expect(proxyData.service).toBe('kivo-api');
    expect(proxyData.database).toBe('connected');
  });
});
