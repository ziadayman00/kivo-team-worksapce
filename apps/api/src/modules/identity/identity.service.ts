import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { Database } from '../../database/database.module';
import * as schema from '../../database/schema';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Registers a new Account and stores Argon2id password credentials.
   */
  async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check if account already exists
    const [existing] = await this.db
      .select({ id: schema.accounts.id })
      .from(schema.accounts)
      .where(eq(schema.accounts.email, normalizedEmail))
      .limit(1);

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const passwordHash = await this.passwordService.hash(input.password);

    // Create Account and Credentials in a transaction
    return await this.db.transaction(async (tx) => {
      const [account] = await tx
        .insert(schema.accounts)
        .values({
          email: normalizedEmail,
          displayName: input.displayName.trim(),
          status: 'ACTIVE',
        })
        .returning();

      if (!account) {
        throw new Error('Failed to create account.');
      }

      await tx.insert(schema.userCredentials).values({
        accountId: account.id,
        passwordHash,
      });

      return {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        createdAt: account.createdAt,
      };
    });
  }

  /**
   * Authenticates an Account via email & password and generates a secure session token.
   */
  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Fetch account and credential in a single join
    const [record] = await this.db
      .select({
        account: schema.accounts,
        credential: schema.userCredentials,
      })
      .from(schema.accounts)
      .innerJoin(schema.userCredentials, eq(schema.accounts.id, schema.userCredentials.accountId))
      .where(eq(schema.accounts.email, normalizedEmail))
      .limit(1);

    if (!record || record.account.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await this.passwordService.verify(
      record.credential.passwordHash,
      input.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Generate high-entropy opaque session
    const session = await this.sessionService.createSession(record.account.id, {
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      account: {
        id: record.account.id,
        email: record.account.email,
        displayName: record.account.displayName,
        avatarUrl: record.account.avatarUrl,
      },
      sessionToken: session.rawToken,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Logs out by revoking the server-side session.
   */
  async logout(rawToken: string): Promise<boolean> {
    return this.sessionService.revokeSession(rawToken);
  }

  /**
   * Retrieves an account by its ID.
   */
  async getAccountById(accountId: string) {
    const [account] = await this.db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, accountId))
      .limit(1);

    return account ?? null;
  }
}
