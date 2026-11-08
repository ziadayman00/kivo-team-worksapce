import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, './.env'), override: true });

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/kivo_dev',
  },
  verbose: true,
  strict: true,
});
