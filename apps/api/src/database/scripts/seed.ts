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

  // Check if default test workspace exists, or insert it deterministically
  const existing = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.slug, 'kivo-core'))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.workspaces).values({
      name: 'KIVO Core Team',
      slug: 'kivo-core',
      status: 'ACTIVE',
      authorizationVersion: 1,
    });
    console.log('Seeded initial workspace: kivo-core');
  } else {
    console.log('Workspace kivo-core already exists, skipping.');
  }

  console.log('Deterministic seeding completed successfully.');
  await pool.end();
}

runSeed().catch((err) => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
