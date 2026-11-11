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

  test('workspace bootstrap & multi-workspace switching via WorkspaceSwitcher (ZIA-26 / M1-05)', async ({
    page,
  }) => {
    const switchId = Date.now();
    const switchUser = {
      displayName: `Switcher ${switchId}`,
      email: `switch.${switchId}@kivo.test`,
      password: 'Password123!',
    };
    const ws1 = {
      name: `Prime Systems ${switchId}`,
      slug: `prime-systems-${switchId}`,
    };
    const ws2 = {
      name: `Apex Labs ${switchId}`,
      slug: `apex-labs-${switchId}`,
    };

    // 1. Register user
    await page.goto('/register');
    await page.getByLabel(/full name/i).fill(switchUser.displayName);
    await page.getByLabel(/email address/i).fill(switchUser.email);
    await page.getByLabel(/^password/i).fill(switchUser.password);
    await page.getByLabel(/confirm password/i).fill(switchUser.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/');

    // 2. Create Workspace 1
    await page
      .getByRole('link', { name: /create workspace/i })
      .first()
      .click();
    await page.getByLabel(/workspace name/i).fill(ws1.name);
    await page.getByRole('button', { name: /customize slug/i }).click();
    await page.getByLabel(/workspace url slug/i).fill(ws1.slug);
    await page.getByRole('button', { name: /^create workspace$/i }).click();
    await expect(page).toHaveURL(`/workspaces/${ws1.slug}`);

    // 3. Create Workspace 2
    await page.goto('/create-workspace');
    await page.getByLabel(/workspace name/i).fill(ws2.name);
    await page.getByRole('button', { name: /customize slug/i }).click();
    await page.getByLabel(/workspace url slug/i).fill(ws2.slug);
    await page.getByRole('button', { name: /^create workspace$/i }).click();
    await expect(page).toHaveURL(`/workspaces/${ws2.slug}`);

    // 4. In Workspace 2, open WorkspaceSwitcher
    const switcherBtn = page.getByRole('button', { name: /switch workspace/i });
    await expect(switcherBtn).toBeVisible();
    await switcherBtn.click();

    // 5. Verify both workspaces are visible in dropdown
    await expect(page.getByText('Accessible Workspaces')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: new RegExp(ws1.name, 'i') })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: new RegExp(ws2.name, 'i') })).toBeVisible();

    // 6. Click Workspace 1 to switch
    await page.getByRole('menuitem', { name: new RegExp(ws1.name, 'i') }).click();

    // 7. Verify navigation and header updates
    await expect(page).toHaveURL(`/workspaces/${ws1.slug}`);
    await expect(page.getByRole('heading', { level: 1, name: ws1.name })).toBeVisible();
    await expect(page.getByText(`/${ws1.slug}`)).toBeVisible();
  });
});
