import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import * as crypto from 'crypto';
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

describe('PostgreSQL Integration: Secure Auth & Opaque Sessions (ZIA-23 / M1-02)', () => {
  let app: INestApplication;
  const db = getTestDb();

  beforeAll(async () => {
    // Invariant: Integration tests run strictly against real PostgreSQL (ADR-008)
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
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await app.close();
    await closeTestDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers an account with Argon2id credentials in PostgreSQL', async () => {
      const payload = {
        email: 'alice@kivo.test',
        password: 'SecurePassword123!',
        displayName: 'Alice Engineer',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(payload)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.account.email).toBe('alice@kivo.test');
      expect(res.body.data.account.displayName).toBe('Alice Engineer');
      expect(res.body.data.account.id).toBeDefined();

      // Verify PostgreSQL physical tables
      const [account] = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, res.body.data.account.id))
        .limit(1);

      expect(account).toBeDefined();
      expect(account?.email).toBe('alice@kivo.test');
      expect(account?.status).toBe('ACTIVE');

      const [credential] = await db
        .select()
        .from(schema.userCredentials)
        .where(eq(schema.userCredentials.accountId, res.body.data.account.id))
        .limit(1);

      expect(credential).toBeDefined();
      expect(credential?.passwordHash).toMatch(/^\$argon2id\$/);
      // Raw password must never be stored anywhere
      expect(credential?.passwordHash).not.toContain('SecurePassword123!');
    });

    it('rejects registration with duplicate email (409 Conflict)', async () => {
      const payload = {
        email: 'duplicate@kivo.test',
        password: 'SecurePassword123!',
        displayName: 'Original User',
      };

      await request(app.getHttpServer()).post('/api/v1/auth/register').send(payload).expect(201);

      // Duplicate registration attempt with mixed-case email
      const dupRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...payload,
          email: 'Duplicate@kivo.test',
          displayName: 'Second User',
        })
        .expect(409);

      expect(dupRes.body.message).toContain('already exists');
    });

    it('validates registration input schema with Zod (400 Bad Request)', async () => {
      // Weak password (< 8 chars)
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@kivo.test',
          password: 'short',
          displayName: 'Test',
        })
        .expect(400);

      // Invalid email
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          displayName: 'Test',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login & Session Management', () => {
    beforeEach(async () => {
      // Seed user for login tests
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'bob@kivo.test',
          password: 'StrongPassword456!',
          displayName: 'Bob Architect',
        })
        .expect(201);
    });

    it('rejects invalid password with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'bob@kivo.test',
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(res.body.message).toContain('Invalid email or password');
    });

    it('rejects non-existent user with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@kivo.test',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('authenticates user, sets HTTP-only cookie, and persists SHA-256 session hash', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'bob@kivo.test',
          password: 'StrongPassword456!',
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.account.email).toBe('bob@kivo.test');
      expect(res.body.data.token).toBeDefined();

      const rawToken = res.body.data.token as string;
      expect(rawToken).toHaveLength(64); // 32 bytes hex

      // Check Set-Cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookie = Array.isArray(cookies)
        ? cookies.find((c) => c.includes('kivo_session='))
        : cookies;
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain(`kivo_session=${rawToken}`);
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('Path=/');

      // Verify Database storage: DB must store SHA-256 hash, NOT raw token
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const [session] = await db
        .select()
        .from(schema.userSessions)
        .where(eq(schema.userSessions.id, expectedHash))
        .limit(1);

      expect(session).toBeDefined();
      expect(session?.accountId).toBe(res.body.data.account.id);
      expect(session?.revokedAt).toBeNull();
      expect(new Date(session!.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('GET /api/v1/auth/me & Protected Endpoint Authorization', () => {
    let sessionToken: string;
    let accountId: string;

    beforeEach(async () => {
      const reg = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
        email: 'charlie@kivo.test',
        password: 'SecurePassword789!',
        displayName: 'Charlie Tester',
      });
      accountId = reg.body.data.account.id;

      const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'charlie@kivo.test',
        password: 'SecurePassword789!',
      });
      sessionToken = login.body.data.token;
    });

    it('rejects unauthenticated request with 401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('authenticates successfully via HTTP-only cookie', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`kivo_session=${sessionToken}`])
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.account.id).toBe(accountId);
      expect(res.body.data.account.email).toBe('charlie@kivo.test');
      expect(res.body.data.account.displayName).toBe('Charlie Tester');
    });

    it('authenticates successfully via Authorization Bearer header', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.account.id).toBe(accountId);
    });

    it('rejects tampered / invalid session token with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', ['kivo_session=invalid-token-content-123456789'])
        .expect(401);
    });

    it('rejects expired sessions with 401', async () => {
      const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      // Set expiresAt in the past
      await db
        .update(schema.userSessions)
        .set({ expiresAt: new Date(Date.now() - 10000) })
        .where(eq(schema.userSessions.id, tokenHash));

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`kivo_session=${sessionToken}`])
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout & Session Revocation', () => {
    it('revokes session in PostgreSQL and clears cookie', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/register').send({
        email: 'dave@kivo.test',
        password: 'Password999!',
        displayName: 'Dave Ops',
      });

      const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        email: 'dave@kivo.test',
        password: 'Password999!',
      });
      const token = login.body.data.token as string;

      // Ensure /me works before logout
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`kivo_session=${token}`])
        .expect(200);

      // Perform logout
      const logoutRes = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [`kivo_session=${token}`])
        .expect(200);

      expect(logoutRes.body.status).toBe('success');

      // Verify session is marked revoked in PostgreSQL
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const [session] = await db
        .select()
        .from(schema.userSessions)
        .where(eq(schema.userSessions.id, tokenHash))
        .limit(1);

      expect(session).toBeDefined();
      expect(session?.revokedAt).not.toBeNull();

      // Subsequent call to /me MUST fail with 401
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`kivo_session=${token}`])
        .expect(401);
    });
  });
});
