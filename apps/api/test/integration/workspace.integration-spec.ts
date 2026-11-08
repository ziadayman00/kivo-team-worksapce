import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION, PG_POOL } from '../../src/database/database.constants';
import {
  getTestDb,
  getTestPool,
  cleanTestDatabase,
  closeTestDatabase,
  migrateTestDatabase,
  TEST_DATABASE_URL,
} from '../helpers/test-db';
import * as schema from '../../src/database/schema';

describe('PostgreSQL Integration: Workspace Creation & Profile Management (ZIA-25 / M1-04)', () => {
  let app: INestApplication;
  const db = getTestDb();

  let userAId: string;
  let userAToken: string;
  let userBId: string;
  let userBToken: string;

  beforeAll(async () => {
    expect(TEST_DATABASE_URL).toContain('postgresql://');
    expect(TEST_DATABASE_URL).toContain('kivo_test');
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    await migrateTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(getTestPool())
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(getTestDb())
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  beforeEach(async () => {
    await cleanTestDatabase();

    // Register User A
    const regA = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user-a@kivo.test',
      password: 'Password123!',
      displayName: 'User Alpha',
    });
    userAId = regA.body.data.account.id;

    const loginA = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user-a@kivo.test', password: 'Password123!' });
    userAToken = loginA.body.data.token;

    // Register User B
    const regB = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user-b@kivo.test',
      password: 'Password123!',
      displayName: 'User Beta',
    });
    userBId = regB.body.data.account.id;

    const loginB = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user-b@kivo.test', password: 'Password123!' });
    userBToken = loginB.body.data.token;
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await app.close();
    await closeTestDatabase();
  });

  describe('POST /api/v1/workspaces', () => {
    it('creates workspace and assigns creator as OWNER in PostgreSQL', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({
          name: 'Stark Industries',
          slug: 'stark-industries',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.workspace.name).toBe('Stark Industries');
      expect(res.body.data.workspace.slug).toBe('stark-industries');
      expect(res.body.data.workspace.role).toBe('OWNER');

      const workspaceId = res.body.data.workspace.id;

      // Verify physical workspace record in PostgreSQL
      const [wsRow] = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, workspaceId))
        .limit(1);

      expect(wsRow).toBeDefined();
      expect(wsRow?.name).toBe('Stark Industries');
      expect(wsRow?.ownerAccountId).toBe(userAId);

      // Verify physical membership record in PostgreSQL
      const [memRow] = await db
        .select()
        .from(schema.workspaceMemberships)
        .where(eq(schema.workspaceMemberships.workspaceId, workspaceId))
        .limit(1);

      expect(memRow).toBeDefined();
      expect(memRow?.accountId).toBe(userAId);
      expect(memRow?.role).toBe('OWNER');
      expect(memRow?.status).toBe('ACTIVE');
    });

    it('auto-generates slug from name if slug is omitted', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({
          name: 'Wayne Enterprises (HQ)',
        })
        .expect(201);

      expect(res.body.data.workspace.slug).toBe('wayne-enterprises-hq');
    });

    it('rejects duplicate slug with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({
          name: 'Unique Corp',
          slug: 'unique-corp',
        })
        .expect(201);

      const dupRes = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .send({
          name: 'Unique Corp 2',
          slug: 'unique-corp',
        })
        .expect(409);

      expect(dupRes.body.message).toContain('already in use');
    });

    it('rejects unauthenticated request with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .send({ name: 'Secret Org' })
        .expect(401);
    });
  });

  describe('GET /api/v1/workspaces (Tenant Isolation)', () => {
    it('returns only workspaces where the caller is an active member', async () => {
      // User A creates Workspace A
      await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ name: 'Alpha Workspace', slug: 'alpha-workspace' })
        .expect(201);

      // User B creates Workspace B
      await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .send({ name: 'Beta Workspace', slug: 'beta-workspace' })
        .expect(201);

      // User A requests workspace list
      const resA = await request(app.getHttpServer())
        .get('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(200);

      const workspacesA = resA.body.data.workspaces;
      expect(workspacesA).toHaveLength(1);
      expect(workspacesA[0]?.slug).toBe('alpha-workspace');
      expect(workspacesA[0]?.role).toBe('OWNER');

      // User B requests workspace list
      const resB = await request(app.getHttpServer())
        .get('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(200);

      const workspacesB = resB.body.data.workspaces;
      expect(workspacesB).toHaveLength(1);
      expect(workspacesB[0]?.slug).toBe('beta-workspace');
    });
  });

  describe('GET /api/v1/workspaces/:slug', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ name: 'Private Lab', slug: 'private-lab' })
        .expect(201);
    });

    it('allows member to access workspace profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/workspaces/private-lab')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.workspace.slug).toBe('private-lab');
      expect(res.body.data.workspace.role).toBe('OWNER');
    });

    it('blocks non-member with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/workspaces/private-lab')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(403);

      expect(res.body.message).toContain('do not have access');
    });

    it('returns 404 for non-existent workspace slug', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/workspaces/ghost-workspace')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(404);
    });
  });

  describe('PATCH /api/v1/workspaces/:slug', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const ws = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ name: 'Original Name', slug: 'mutable-workspace' });
      workspaceId = ws.body.data.workspace.id;
    });

    it('allows owner to update workspace name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/workspaces/mutable-workspace')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.workspace.name).toBe('Updated Name');

      // Verify in PostgreSQL
      const [updated] = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, workspaceId))
        .limit(1);

      expect(updated?.name).toBe('Updated Name');
    });

    it('rejects update by non-member with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/workspaces/mutable-workspace')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .send({ name: 'Hijacked Name' })
        .expect(403);
    });

    it('rejects update by regular MEMBER with 403 Forbidden', async () => {
      // Add User B as regular MEMBER
      await db.insert(schema.workspaceMemberships).values({
        workspaceId,
        accountId: userBId,
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/workspaces/mutable-workspace')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .send({ name: 'Member Attempt' })
        .expect(403);

      expect(res.body.message).toContain('Only workspace owners and administrators');
    });
  });

  describe('Invitations & Membership Lifecycle (ZIA-25)', () => {
    let workspaceId: string;
    let inviteToken: string;

    beforeEach(async () => {
      const ws = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ name: 'Avengers HQ', slug: 'avengers-hq' })
        .expect(201);
      workspaceId = ws.body.data.workspace.id;

      // User A invites User B (user-b@kivo.test)
      const invRes = await request(app.getHttpServer())
        .post('/api/v1/workspaces/avengers-hq/invitations')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ email: 'user-b@kivo.test', role: 'MEMBER' })
        .expect(201);

      inviteToken = invRes.body.data.invitation.token;
      expect(inviteToken).toBeDefined();
    });

    it('stores token securely hashed (SHA-256) in PostgreSQL', async () => {
      const [inv] = await db
        .select()
        .from(schema.workspaceInvitations)
        .where(eq(schema.workspaceInvitations.workspaceId, workspaceId))
        .limit(1);

      expect(inv).toBeDefined();
      expect(inv?.email).toBe('user-b@kivo.test');
      expect(inv?.status).toBe('PENDING');
      // Token stored is not the raw token
      expect(inv?.tokenHash).not.toBe(inviteToken);
      expect(inv?.tokenHash).toHaveLength(64); // SHA-256 hex string
    });

    it('allows public resolution of invitation details by token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/invitations/${inviteToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.invitation.email).toBe('user-b@kivo.test');
      expect(res.body.data.invitation.workspace.slug).toBe('avengers-hq');
    });

    it('rejects acceptance if signed in with mismatched email (Identity Binding)', async () => {
      // User A (user-a@kivo.test) attempts to accept invite meant for user-b@kivo.test
      const res = await request(app.getHttpServer())
        .post(`/api/v1/invitations/${inviteToken}/accept`)
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(403);

      expect(res.body.message).toContain('This invitation was issued to');
    });

    it('allows invited recipient to accept and grants workspace access', async () => {
      // User B accepts
      const acceptRes = await request(app.getHttpServer())
        .post(`/api/v1/invitations/${inviteToken}/accept`)
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(200);

      expect(acceptRes.body.status).toBe('success');
      expect(acceptRes.body.data.workspace.slug).toBe('avengers-hq');

      // Verify User B can now access avengers-hq
      const wsRes = await request(app.getHttpServer())
        .get('/api/v1/workspaces/avengers-hq')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(200);

      expect(wsRes.body.data.workspace.role).toBe('MEMBER');

      // Verify single-use token: replay attempt rejected
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${inviteToken}/accept`)
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(409);
    });

    it('suspending a member immediately revokes their workspace access', async () => {
      // User B accepts invite
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${inviteToken}/accept`)
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(200);

      // List members to find User B's membership ID
      const membersRes = await request(app.getHttpServer())
        .get('/api/v1/workspaces/avengers-hq/members')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(200);

      const memberB = membersRes.body.data.members.find(
        (m: { email: string }) => m.email === 'user-b@kivo.test',
      );
      expect(memberB).toBeDefined();

      // Owner suspends User B
      await request(app.getHttpServer())
        .patch(`/api/v1/workspaces/avengers-hq/members/${memberB.id}`)
        .set('Cookie', [`kivo_session=${userAToken}`])
        .send({ status: 'SUSPENDED' })
        .expect(200);

      // Subsequent access by User B is blocked with 403 Forbidden
      const blockedRes = await request(app.getHttpServer())
        .get('/api/v1/workspaces/avengers-hq')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(403);

      expect(blockedRes.body.message).toContain('do not have access');
    });

    it('removing a member deletes membership and denies subsequent access', async () => {
      // User B accepts invite
      await request(app.getHttpServer())
        .post(`/api/v1/invitations/${inviteToken}/accept`)
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(200);

      const membersRes = await request(app.getHttpServer())
        .get('/api/v1/workspaces/avengers-hq/members')
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(200);

      const memberB = membersRes.body.data.members.find(
        (m: { email: string }) => m.email === 'user-b@kivo.test',
      );

      // Owner removes User B
      await request(app.getHttpServer())
        .delete(`/api/v1/workspaces/avengers-hq/members/${memberB.id}`)
        .set('Cookie', [`kivo_session=${userAToken}`])
        .expect(200);

      // User B denied
      await request(app.getHttpServer())
        .get('/api/v1/workspaces/avengers-hq')
        .set('Cookie', [`kivo_session=${userBToken}`])
        .expect(403);
    });
  });
});
