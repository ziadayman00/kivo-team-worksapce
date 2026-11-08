import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
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
 * Workspaces Foundation Table (Baseline from SD-06)
 * Core tenant boundary entity.
 */
export const workspaces = pgTable('workspaces', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status').notNull().default('ACTIVE'),
  authorizationVersion: integer('authorization_version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
