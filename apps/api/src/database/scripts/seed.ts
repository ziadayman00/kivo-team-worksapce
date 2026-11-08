import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  console.log(`Seeding database: ${connectionString.split('@')[1] || connectionString}`);

  // Insert or update system metadata
  await db
    .insert(schema.systemMetadata)
    .values({
      key: 'foundation_initialized',
      value: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: schema.systemMetadata.key,
      set: {
        value: new Date().toISOString(),
        updatedAt: new Date(),
      },
    });

  // Deterministic Accounts
  const [alice] = await db
    .insert(schema.accounts)
    .values({
      email: 'alice@kivo.test',
      displayName: 'Alice Engineer',
      status: 'ACTIVE',
    })
    .onConflictDoUpdate({
      target: schema.accounts.email,
      set: { displayName: 'Alice Engineer' },
    })
    .returning();

  const [bob] = await db
    .insert(schema.accounts)
    .values({
      email: 'bob@kivo.test',
      displayName: 'Bob Developer',
      status: 'ACTIVE',
    })
    .onConflictDoUpdate({
      target: schema.accounts.email,
      set: { displayName: 'Bob Developer' },
    })
    .returning();

  if (alice) {
    await db
      .insert(schema.userCredentials)
      .values({
        accountId: alice.id,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashtest$seedpasswordhashalice',
      })
      .onConflictDoNothing();
  }

  if (bob) {
    await db
      .insert(schema.userCredentials)
      .values({
        accountId: bob.id,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashtest$seedpasswordhashbob',
      })
      .onConflictDoNothing();
  }

  // Check if default test workspace exists, or insert it deterministically
  const existing = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.slug, 'kivo-core'))
    .limit(1);

  let workspaceId: string;
  if (existing.length === 0) {
    const [created] = await db
      .insert(schema.workspaces)
      .values({
        name: 'KIVO Core Team',
        slug: 'kivo-core',
        ownerAccountId: alice?.id,
        status: 'ACTIVE',
        authorizationVersion: 1,
      })
      .returning();
    workspaceId = created!.id;
    console.log('Seeded initial workspace: kivo-core');
  } else {
    workspaceId = existing[0]!.id;
    console.log('Workspace kivo-core already exists.');
  }

  // Seed memberships for Alice (OWNER) and Bob (MEMBER)
  if (alice) {
    await db
      .insert(schema.workspaceMemberships)
      .values({
        workspaceId,
        accountId: alice.id,
        role: 'OWNER',
        status: 'ACTIVE',
      })
      .onConflictDoNothing();
  }

  if (bob) {
    await db
      .insert(schema.workspaceMemberships)
      .values({
        workspaceId,
        accountId: bob.id,
        role: 'MEMBER',
        status: 'ACTIVE',
      })
      .onConflictDoNothing();
  }

  console.log('Deterministic seeding completed successfully.');
  await pool.end();
}

runSeed().catch((err) => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
