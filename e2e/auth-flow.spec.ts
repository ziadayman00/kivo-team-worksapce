import { test, expect } from '@playwright/test';

test.describe('KIVO User Authentication & Session Lifecycle (ZIA-24 / M1-03)', () => {
  const uniqueId = Date.now();
  const testUser = {
    displayName: `E2E User ${uniqueId}`,
    email: `e2e.user.${uniqueId}@kivo.test`,
    password: 'ValidPassword123!',
  };

  test('validates registration form client-side errors', async ({ page }) => {
    await page.goto('/register');

    // Attempt submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Weak password error
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('test@kivo.test');
    await page.getByLabel(/^password/i).fill('short');
    await page.getByLabel(/confirm password/i).fill('short');
    await page.getByRole('button', { name: /create account/i }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/at least 8 characters/i);

    // Mismatched passwords
    await page.getByLabel(/^password/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByRole('alert')).toContainText(/passwords do not match/i);
  });

  test('full authentication journey: register -> session verify -> refresh -> logout -> login', async ({
    page,
  }) => {
    // 1. Register new user
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill(testUser.displayName);
    await page.getByLabel(/email address/i).fill(testUser.email);
    await page.getByLabel(/^password/i).fill(testUser.password);
    await page.getByLabel(/confirm password/i).fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Automatically redirected to Dashboard upon successful registration
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: 'KIVO' })).toBeVisible();
    await expect(page.getByTestId('app-status')).toHaveText('Status: Initialized');
    await expect(page.getByText(testUser.displayName).first()).toBeVisible();
    await expect(page.getByText(testUser.email)).toBeVisible();

    // Invariant: Verify NO token or secret in browser localStorage or sessionStorage
    const localStorageTokens = await page.evaluate(() => {
      return Object.keys(localStorage).filter(
        (key) => key.toLowerCase().includes('token') || key.toLowerCase().includes('session'),
      );
    });
    expect(localStorageTokens).toHaveLength(0);

    const sessionStorageTokens = await page.evaluate(() => {
      return Object.keys(sessionStorage).filter(
        (key) => key.toLowerCase().includes('token') || key.toLowerCase().includes('session'),
      );
    });
    expect(sessionStorageTokens).toHaveLength(0);

    // 2. Page reload keeps session authenticated (via HTTP-only cookie)
    await page.reload();
    await expect(page).toHaveURL('/');
    await expect(page.getByText(testUser.displayName).first()).toBeVisible();

    // 3. Logout clears session and redirects to /login
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /sign in to kivo/i })).toBeVisible();

    // 4. Attempting to access protected / route redirects back to /login
    await page.goto('/');
    await expect(page).toHaveURL('/login');

    // 5. Test invalid login credentials
    await page.getByLabel(/email address/i).fill(testUser.email);
    await page.getByLabel(/^password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);

    // 6. Test valid login
    await page.getByLabel(/^password/i).fill(testUser.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(testUser.displayName).first()).toBeVisible();
  });
});
