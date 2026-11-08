import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

async function runReset() {
  const connectionString =
    process.env.TARGET_DB === 'test'
      ? process.env.DATABASE_URL_TEST || 'postgresql://postgres:password@localhost:5432/kivo_test'
      : process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kivo_dev';

  if (!connectionString) {
    throw new Error('DATABASE_URL / DATABASE_URL_TEST is not set.');
  }

  const pool = new Pool({ connectionString });
  console.log(`Resetting database: ${connectionString.split('@')[1] || connectionString}`);

  // Drop and recreate schemas
  await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE;');
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
  await pool.query('CREATE SCHEMA public AUTHORIZATION postgres;');
  await pool.query('GRANT ALL ON SCHEMA public TO postgres;');
  await pool.query('GRANT ALL ON SCHEMA public TO public;');

  console.log('Schemas reset. Applying migrations...');
  const db = drizzle(pool);
  const migrationsFolder = path.resolve(__dirname, '../../../drizzle');

  await migrate(db, { migrationsFolder });
  console.log('Migrations applied successfully.');

  await pool.end();
  console.log('Database reset and migration complete.');
}

runReset().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
