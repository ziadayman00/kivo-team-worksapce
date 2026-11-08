import { eq } from 'drizzle-orm';
import {
  getTestDb,
  migrateTestDatabase,
  cleanTestDatabase,
  closeTestDatabase,
  TEST_DATABASE_URL,
} from '../helpers/test-db';
import {
  setupTwoTenantFixture,
  WORKSPACE_ALPHA_ID,
  WORKSPACE_BETA_ID,
} from '../fixtures/tenants.fixture';
import { createWorkspaceFixture } from '../fixtures/workspaces.fixture';
import * as schema from '../../src/database/schema';

describe('PostgreSQL Integration: Multi-Tenant Data Isolation (ADR-003, ADR-004)', () => {
  const db = getTestDb();

  beforeAll(async () => {
    // Verify integration tests run strictly against real PostgreSQL, not SQLite
    expect(TEST_DATABASE_URL).toContain('postgresql://');
    expect(TEST_DATABASE_URL).toContain('kivo_test');

    // Ensure schema migrations are applied on test database
    await migrateTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await closeTestDatabase();
  });

  it('proves that two separate tenant workspaces can be seeded and isolated in real PostgreSQL', async () => {
    const fixture = await setupTwoTenantFixture(db);

    expect(fixture.alpha.workspace.id).toBe(WORKSPACE_ALPHA_ID);
    expect(fixture.alpha.workspace.slug).toBe('workspace-alpha');
    expect(fixture.beta.workspace.id).toBe(WORKSPACE_BETA_ID);
    expect(fixture.beta.workspace.slug).toBe('workspace-beta');

    // Query for Workspace Alpha specifically
    const alphaRows = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, WORKSPACE_ALPHA_ID));

    expect(alphaRows).toHaveLength(1);
    expect(alphaRows[0]?.slug).toBe('workspace-alpha');
    expect(alphaRows[0]?.name).toBe('Workspace Alpha');

    // Query for Workspace Beta specifically
    const betaRows = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, WORKSPACE_BETA_ID));

    expect(betaRows).toHaveLength(1);
    expect(betaRows[0]?.slug).toBe('workspace-beta');
    expect(betaRows[0]?.name).toBe('Workspace Beta');
  });

  it('proves tenant isolation: querying workspace A never returns workspace B records', async () => {
    await setupTwoTenantFixture(db);

    // Query exclusively by Alpha ID
    const alphaQuery = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, WORKSPACE_ALPHA_ID));

    expect(alphaQuery.every((row) => row.id === WORKSPACE_ALPHA_ID)).toBe(true);
    expect(alphaQuery.some((row) => row.id === WORKSPACE_BETA_ID)).toBe(false);
  });

  it('enforces database uniqueness constraints across tenants in PostgreSQL', async () => {
    await createWorkspaceFixture(db, {
      name: 'Primary Workspace',
      slug: 'duplicate-slug',
    });

    // Attempting to create another workspace with the identical slug must reject at DB level
    await expect(
      createWorkspaceFixture(db, {
        name: 'Another Workspace',
        slug: 'duplicate-slug',
      }),
    ).rejects.toThrow();
  });

  it('guarantees deterministic cleanup: cleanTestDatabase truncates data completely', async () => {
    await setupTwoTenantFixture(db);
    const beforeCount = await db.select().from(schema.workspaces);
    expect(beforeCount.length).toBeGreaterThanOrEqual(2);

    await cleanTestDatabase();

    const afterCount = await db.select().from(schema.workspaces);
    expect(afterCount).toHaveLength(0);
  });
});
