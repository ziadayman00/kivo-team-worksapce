import { test, expect } from '@playwright/test';

test.describe('KIVO Workspace Creation, Profile & Slug Routing (ZIA-25 / M1-04)', () => {
  const uniqueId = Date.now();
  const ownerUser = {
    displayName: `Owner ${uniqueId}`,
    email: `owner.${uniqueId}@kivo.test`,
    password: 'Password123!',
  };
  const otherUser = {
    displayName: `Other ${uniqueId}`,
    email: `other.${uniqueId}@kivo.test`,
    password: 'Password123!',
  };
  const workspaceData = {
    name: `Acme Robotics ${uniqueId}`,
    slug: `acme-robotics-${uniqueId}`,
    updatedName: `Acme Automation ${uniqueId}`,
  };

  test('full workspace journey: create -> slug routing -> settings update -> tenant access control', async ({
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

    // 6. Navigate back to Dashboard and verify workspace is listed
    await page.goto('/');
    await expect(page.getByText(workspaceData.updatedName)).toBeVisible();
    await expect(page.getByText(`/${workspaceData.slug}`)).toBeVisible();

    // 7. Click workspace card to navigate back via slug route
    await page.getByText(workspaceData.updatedName).click();
    await expect(page).toHaveURL(`/workspaces/${workspaceData.slug}`);

    // 8. Logout owner
    await page.goto('/');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/login');

    // 9. Register second user
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill(otherUser.displayName);
    await page.getByLabel(/email address/i).fill(otherUser.email);
    await page.getByLabel(/^password/i).fill(otherUser.password);
    await page.getByLabel(/confirm password/i).fill(otherUser.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    // 10. Attempt to access owner's workspace -> verify access denied (tenant isolation)
    await page.goto(`/workspaces/${workspaceData.slug}`);
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/do not have access|permission/i);
  });
});
