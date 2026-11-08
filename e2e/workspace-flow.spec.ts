import { test, expect } from '@playwright/test';

test.describe('KIVO Workspace Creation, Profile & Slug Routing (ZIA-25 / M1-04)', () => {
  const uniqueId = Date.now();
  const ownerUser = {
    displayName: `Owner ${uniqueId}`,
    email: `owner.${uniqueId}@kivo.test`,
    password: 'Password123!',
  };
  const otherUser = {
    displayName: `Colleague ${uniqueId}`,
    email: `colleague.${uniqueId}@kivo.test`,
    password: 'Password123!',
  };
  const workspaceData = {
    name: `Acme Robotics ${uniqueId}`,
    slug: `acme-robotics-${uniqueId}`,
    updatedName: `Acme Automation ${uniqueId}`,
  };

  test('full workspace journey: create -> slug routing -> settings update -> invite -> accept -> suspension', async ({
    page,
  }) => {
    // 1. Register owner user
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill(ownerUser.displayName);
    await page.getByLabel(/email address/i).fill(ownerUser.email);
    await page.getByLabel(/^password/i).fill(ownerUser.password);
    await page.getByLabel(/confirm password/i).fill(ownerUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/');

    // 2. Click "Create Workspace" from Dashboard
    await page
      .getByRole('link', { name: /create workspace/i })
      .first()
      .click();
    await expect(page).toHaveURL('/create-workspace');
    await expect(page.getByRole('heading', { name: /create a new workspace/i })).toBeVisible();

    // 3. Fill in workspace details with custom slug
    await page.getByLabel(/workspace name/i).fill(workspaceData.name);
    await page.getByRole('button', { name: /customize slug/i }).click();
    await page.getByLabel(/workspace url slug/i).fill(workspaceData.slug);

    await page.getByRole('button', { name: /^create workspace$/i }).click();

    // 4. Verify slug-based routing redirects to /workspaces/:slug
    await expect(page).toHaveURL(`/workspaces/${workspaceData.slug}`);
    await expect(page.getByRole('heading', { level: 1, name: workspaceData.name })).toBeVisible();
    await expect(page.getByText(`/${workspaceData.slug}`)).toBeVisible();
    await expect(page.getByText('OWNER').first()).toBeVisible();

    // 5. Update workspace name via settings
    const nameInput = page.getByLabel(/workspace name/i);
    await nameInput.fill(workspaceData.updatedName);
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByRole('status')).toContainText(/updated successfully/i);
    await expect(
      page.getByRole('heading', { level: 1, name: workspaceData.updatedName }),
    ).toBeVisible();

    // 6. Send Invitation to colleague
    await page.getByPlaceholder('colleague@example.com').fill(otherUser.email);
    await page.getByRole('button', { name: /send invite/i }).click();

    const inviteLinkInput = page.locator('input[readonly]');
    await expect(inviteLinkInput).toBeVisible({ timeout: 10000 });
    const inviteUrl = await inviteLinkInput.inputValue();
    expect(inviteUrl).toContain('/invite/');

    // 7. Logout owner
    await page.goto('/');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/login');

    // 8. Register colleague user
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill(otherUser.displayName);
    await page.getByLabel(/email address/i).fill(otherUser.email);
    await page.getByLabel(/^password/i).fill(otherUser.password);
    await page.getByLabel(/confirm password/i).fill(otherUser.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    // 9. Colleague attempts to directly access workspace before accepting invite -> 403 Forbidden
    await page.goto(`/workspaces/${workspaceData.slug}`);
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/do not have access|permission/i);

    // 10. Colleague visits the invitation link
    await page.goto(inviteUrl);
    await expect(page.getByText(/workspace invitation/i)).toBeVisible();
    await expect(page.getByText(workspaceData.updatedName)).toBeVisible();
    await expect(page.getByText(otherUser.email, { exact: true })).toBeVisible();

    // 11. Colleague accepts the invitation
    await page.getByRole('button', { name: /accept & join workspace/i }).click();

    // 12. Colleague is redirected to workspace and gains access
    await expect(page).toHaveURL(`/workspaces/${workspaceData.slug}`);
    await expect(
      page.getByRole('heading', { level: 1, name: workspaceData.updatedName }),
    ).toBeVisible();
    await expect(page.getByText('MEMBER').first()).toBeVisible();

    // 13. Colleague logs out
    await page.goto('/');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/login');

    // 14. Owner logs back in and suspends colleague
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(ownerUser.email);
    await page.getByLabel(/password/i).fill(ownerUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto(`/workspaces/${workspaceData.slug}`);
    await expect(page.getByText(otherUser.displayName)).toBeVisible();

    // Click suspend button for colleague
    const suspendBtn = page.locator('button[title="Suspend Member"]').first();
    await suspendBtn.click();
    await expect(page.getByRole('status')).toContainText(/member updated successfully/i);

    // 15. Owner logs out
    await page.goto('/');
    await page.getByRole('button', { name: /log out/i }).click();

    // 16. Colleague logs in and attempts to access workspace -> denied because status is SUSPENDED
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(otherUser.email);
    await page.getByLabel(/password/i).fill(otherUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto(`/workspaces/${workspaceData.slug}`);
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/do not have access|permission/i);
  });
});
