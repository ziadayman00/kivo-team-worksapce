import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import path from 'path';
import * as dotenv from 'dotenv';
import * as schema from '../../src/database/schema';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

let testPool: Pool | null = null;
let testDb: NodePgDatabase<typeof schema> | null = null;

export const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST || 'postgresql://postgres:password@localhost:5432/kivo_test';

export function getTestPool(): Pool {
  if (!testPool) {
    testPool = new Pool({
      connectionString: TEST_DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
    });
  }
  return testPool;
}

export function getTestDb(): NodePgDatabase<typeof schema> {
  if (!testDb) {
    testDb = drizzle(getTestPool(), { schema });
  }
  return testDb;
}

export async function migrateTestDatabase(): Promise<void> {
  const db = getTestDb();
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
}

export async function cleanTestDatabase(): Promise<void> {
  const db = getTestDb();
  // Clean all application tables in safe foreign-key order
  await db.execute(sql`TRUNCATE TABLE accounts, workspaces, system_metadata CASCADE`);
}

export async function closeTestDatabase(): Promise<void> {
  if (testPool) {
    const pool = testPool;
    testPool = null;
    testDb = null;
    if (!(pool as any).ending && !(pool as any).ended) {
      await pool.end();
    }
  }
}
