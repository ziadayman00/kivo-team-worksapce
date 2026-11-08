import { eq, and } from 'drizzle-orm';
import {
  getTestDb,
  migrateTestDatabase,
  cleanTestDatabase,
  closeTestDatabase,
  TEST_DATABASE_URL,
} from '../helpers/test-db';
import * as schema from '../../src/database/schema';

describe('PostgreSQL Integration: Identity & Workspace Core Schema (ZIA-22 / M1-01)', () => {
  const db = getTestDb();

  beforeAll(async () => {
    // Invariant: Integration tests run strictly against real PostgreSQL (ADR-008)
    expect(TEST_DATABASE_URL).toContain('postgresql://');
    expect(TEST_DATABASE_URL).toContain('kivo_test');
    await migrateTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await closeTestDatabase();
  });

  it('enforces email uniqueness constraint on accounts table', async () => {
    const email = 'unique.user@kivo.test';

    // First account insert succeeds
    const [account1] = await db
      .insert(schema.accounts)
      .values({
        email,
        displayName: 'User One',
      })
      .returning();

    expect(account1).toBeDefined();
    expect(account1?.email).toBe(email);

    // Second account insert with identical email must throw unique constraint error
    await expect(
      db.insert(schema.accounts).values({
        email,
        displayName: 'User Two',
      }),
    ).rejects.toThrow();
  });

  it('allows a single global Account to hold memberships across multiple distinct Workspaces', async () => {
    // 1. Create a global user account
    const [user] = await db
      .insert(schema.accounts)
      .values({
        email: 'global.user@kivo.test',
        displayName: 'Global Contributor',
      })
      .returning();

    expect(user).toBeDefined();

    // 2. Create two distinct workspaces
    const [ws1] = await db
      .insert(schema.workspaces)
      .values({
        name: 'Workspace Alpha',
        slug: 'ws-alpha',
        ownerAccountId: user!.id,
      })
      .returning();

    const [ws2] = await db
      .insert(schema.workspaces)
      .values({
        name: 'Workspace Beta',
        slug: 'ws-beta',
        ownerAccountId: user!.id,
      })
      .returning();

    expect(ws1).toBeDefined();
    expect(ws2).toBeDefined();

    // 3. Create memberships for the same user in both workspaces
    await db.insert(schema.workspaceMemberships).values([
      {
        workspaceId: ws1!.id,
        accountId: user!.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
      {
        workspaceId: ws2!.id,
        accountId: user!.id,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    ]);

    // 4. Query all memberships for this user
    const userMemberships = await db
      .select()
      .from(schema.workspaceMemberships)
      .where(eq(schema.workspaceMemberships.accountId, user!.id));

    expect(userMemberships).toHaveLength(2);
    const workspaceIds = userMemberships.map((m) => m.workspaceId);
    expect(workspaceIds).toContain(ws1!.id);
    expect(workspaceIds).toContain(ws2!.id);
  });

  it('enforces composite uniqueness on (workspace_id, account_id) in workspace_memberships', async () => {
    const [user] = await db
      .insert(schema.accounts)
      .values({
        email: 'single.membership@kivo.test',
        displayName: 'Single Member',
      })
      .returning();

    const [ws] = await db
      .insert(schema.workspaces)
      .values({
        name: 'Unique Test WS',
        slug: 'unique-test-ws',
      })
      .returning();

    // Initial membership insert succeeds
    await db.insert(schema.workspaceMemberships).values({
      workspaceId: ws!.id,
      accountId: user!.id,
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    // Duplicate membership insert in the same workspace must fail
    await expect(
      db.insert(schema.workspaceMemberships).values({
        workspaceId: ws!.id,
        accountId: user!.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      }),
    ).rejects.toThrow();
  });

  it('guarantees invitation lifecycle isolation: pending invitation does not create an active membership', async () => {
    const [inviter] = await db
      .insert(schema.accounts)
      .values({
        email: 'inviter@kivo.test',
        displayName: 'Inviter Admin',
      })
      .returning();

    const [ws] = await db
      .insert(schema.workspaces)
      .values({
        name: 'Invitation Test WS',
        slug: 'invitation-test-ws',
        ownerAccountId: inviter!.id,
      })
      .returning();

    const inviteeEmail = 'invitee@kivo.test';
    const tokenHash = 'mock-sha256-invitation-hash-12345';

    // 1. Create a pending invitation
    const [invitation] = await db
      .insert(schema.workspaceInvitations)
      .values({
        workspaceId: ws!.id,
        email: inviteeEmail,
        role: 'MEMBER',
        tokenHash,
        invitedByAccountId: inviter!.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      })
      .returning();

    expect(invitation).toBeDefined();
    expect(invitation?.status).toBe('PENDING');

    // 2. Verify NO membership exists for this invitee email
    const memberships = await db
      .select()
      .from(schema.workspaceMemberships)
      .where(eq(schema.workspaceMemberships.workspaceId, ws!.id));

    // Only 0 memberships (or whatever existed before, none for invitee)
    expect(memberships).toHaveLength(0);

    // 3. Token hash uniqueness must be enforced
    await expect(
      db.insert(schema.workspaceInvitations).values({
        workspaceId: ws!.id,
        email: 'another@kivo.test',
        role: 'MEMBER',
        tokenHash, // same token hash
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }),
    ).rejects.toThrow();
  });

  it('enforces foreign-key cascading and referential integrity across identity and workspace tables', async () => {
    // 1. Create account, credentials, and session
    const [user] = await db
      .insert(schema.accounts)
      .values({
        email: 'cascade.test@kivo.test',
        displayName: 'Cascade User',
      })
      .returning();

    await db.insert(schema.userCredentials).values({
      accountId: user!.id,
      passwordHash: 'dummy-hash',
    });

    await db.insert(schema.userSessions).values({
      id: 'session-token-hash-xyz',
      accountId: user!.id,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const [ws] = await db
      .insert(schema.workspaces)
      .values({
        name: 'Cascade WS',
        slug: 'cascade-ws',
      })
      .returning();

    await db.insert(schema.workspaceMemberships).values({
      workspaceId: ws!.id,
      accountId: user!.id,
      role: 'MEMBER',
    });

    // 2. Delete the user
    await db.delete(schema.accounts).where(eq(schema.accounts.id, user!.id));

    // 3. Verify user credentials and sessions are cascaded and deleted
    const credentials = await db
      .select()
      .from(schema.userCredentials)
      .where(eq(schema.userCredentials.accountId, user!.id));
    expect(credentials).toHaveLength(0);

    const sessions = await db
      .select()
      .from(schema.userSessions)
      .where(eq(schema.userSessions.accountId, user!.id));
    expect(sessions).toHaveLength(0);

    // 4. Verify workspace membership was also cascaded and removed
    const memberships = await db
      .select()
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, ws!.id),
          eq(schema.workspaceMemberships.accountId, user!.id),
        ),
      );
    expect(memberships).toHaveLength(0);

    // 5. Workspace itself remains intact
    const remainingWs = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, ws!.id));
    expect(remainingWs).toHaveLength(1);
  });
});
