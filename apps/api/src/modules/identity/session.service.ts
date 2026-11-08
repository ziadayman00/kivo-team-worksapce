import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { Database } from '../../database/database.module';
import * as schema from '../../database/schema';

export interface CreateSessionOptions {
  ipAddress?: string;
  userAgent?: string;
  ttlDays?: number;
}

export interface SessionValidationResult {
  account: typeof schema.accounts.$inferSelect;
  session: typeof schema.userSessions.$inferSelect;
}

@Injectable()
export class SessionService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /**
   * Computes a SHA-256 hash of a raw session token.
   * Only hashes are stored in PostgreSQL; raw high-entropy tokens are held by the client.
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Creates a new server-side session for an authenticated account.
   * Generates a 256-bit cryptographic random token, stores its SHA-256 hash, and sets expiry.
   */
  async createSession(
    accountId: string,
    options: CreateSessionOptions = {},
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const ttlDays = options.ttlDays ?? 7;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.db.insert(schema.userSessions).values({
      id: tokenHash,
      accountId,
      ipAddress: options.ipAddress ?? null,
      userAgent: options.userAgent ?? null,
      expiresAt,
    });

    return { rawToken, expiresAt };
  }

  /**
   * Validates a raw session token against PostgreSQL.
   * Checks for token existence, ensures session is not revoked, not expired, and account is active.
   */
  async validateSession(rawToken: string): Promise<SessionValidationResult | null> {
    if (!rawToken || typeof rawToken !== 'string') {
      return null;
    }

    const tokenHash = this.hashToken(rawToken);
    const now = new Date();

    const [record] = await this.db
      .select({
        account: schema.accounts,
        session: schema.userSessions,
      })
      .from(schema.userSessions)
      .innerJoin(schema.accounts, eq(schema.userSessions.accountId, schema.accounts.id))
      .where(
        and(
          eq(schema.userSessions.id, tokenHash),
          isNull(schema.userSessions.revokedAt),
          gt(schema.userSessions.expiresAt, now),
          eq(schema.accounts.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (!record) {
      return null;
    }

    return record;
  }

  /**
   * Revokes a session immediately by setting revokedAt timestamp.
   */
  async revokeSession(rawToken: string): Promise<boolean> {
    if (!rawToken || typeof rawToken !== 'string') {
      return false;
    }

    const tokenHash = this.hashToken(rawToken);
    const [revoked] = await this.db
      .update(schema.userSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.userSessions.id, tokenHash), isNull(schema.userSessions.revokedAt)))
      .returning();

    return !!revoked;
  }

  /**
   * Revokes all active sessions for an account (e.g., security reset).
   */
  async revokeAllUserSessions(accountId: string): Promise<number> {
    const result = await this.db
      .update(schema.userSessions)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(schema.userSessions.accountId, accountId), isNull(schema.userSessions.revokedAt)),
      )
      .returning();

    return result.length;
  }
}
