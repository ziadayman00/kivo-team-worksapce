import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

async function runMigrate() {
  const connectionString =
    process.env.TARGET_DB === 'test'
      ? process.env.DATABASE_URL_TEST || 'postgresql://postgres:password@localhost:5432/kivo_test'
      : process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kivo_dev';

  if (!connectionString) {
    throw new Error('DATABASE_URL / DATABASE_URL_TEST is not set.');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log(`Running migrations against: ${connectionString.split('@')[1] || connectionString}`);
  const migrationsFolder = path.resolve(__dirname, '../../../drizzle');

  await migrate(db, { migrationsFolder });
  console.log('Migrations applied successfully.');

  await pool.end();
}

runMigrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
