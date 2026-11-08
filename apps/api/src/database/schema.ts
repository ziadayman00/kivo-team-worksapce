import { pgTable, uuid, text, timestamp, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * System Metadata Table
 * Used for database foundation verification, seed status, and operational diagnostics.
 */
export const systemMetadata = pgTable('system_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Accounts Table (IdentityModule)
 * Global account entity representing authenticated individuals.
 */
export const accounts = pgTable('accounts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * User Credentials Table (IdentityModule)
 * Dedicated credential storage containing Argon2id password hashes.
 */
export const userCredentials = pgTable('user_credentials', {
  accountId: uuid('account_id')
    .primaryKey()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  passwordVersion: integer('password_version').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * User Sessions Table (IdentityModule)
 * Server-side opaque sessions. ID stores SHA-256 hash of the session token.
 */
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(), // SHA-256 hash of opaque token
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Workspaces Table (WorkspaceModule)
 * Multi-tenant boundary entity.
 */
export const workspaces = pgTable('workspaces', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerAccountId: uuid('owner_account_id').references(() => accounts.id),
  status: text('status').notNull().default('ACTIVE'),
  authorizationVersion: integer('authorization_version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Workspace Memberships Table (WorkspaceModule)
 * Connects a global Account to a specific Workspace with a defined tenant role.
 */
export const workspaceMemberships = pgTable(
  'workspace_memberships',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('MEMBER'), // OWNER | ADMIN | MEMBER
    status: text('status').notNull().default('ACTIVE'), // ACTIVE | SUSPENDED
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_workspace_memberships_unique').on(table.workspaceId, table.accountId),
    index('idx_workspace_memberships_account').on(table.accountId),
  ],
);

/**
 * Workspace Invitations Table (WorkspaceModule)
 * Manages pending invitations. Single-use hashed token.
 */
export const workspaceInvitations = pgTable(
  'workspace_invitations',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').notNull().default('MEMBER'),
    tokenHash: text('token_hash').notNull().unique(),
    invitedByAccountId: uuid('invited_by_account_id').references(() => accounts.id),
    status: text('status').notNull().default('PENDING'), // PENDING | ACCEPTED | REVOKED | EXPIRED
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_workspace_invitations_lookup').on(table.workspaceId, table.email, table.status),
    index('idx_workspace_invitations_token').on(table.tokenHash),
  ],
);
