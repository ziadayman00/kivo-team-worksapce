import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../src/database/schema';

export interface CreateWorkspaceInput {
  id?: string;
  name: string;
  slug: string;
  status?: string;
  authorizationVersion?: number;
}

export async function createWorkspaceFixture(
  db: NodePgDatabase<typeof schema>,
  input: CreateWorkspaceInput,
) {
  const [created] = await db
    .insert(schema.workspaces)
    .values({
      id: input.id,
      name: input.name,
      slug: input.slug,
      status: input.status ?? 'ACTIVE',
      authorizationVersion: input.authorizationVersion ?? 1,
    })
    .returning();

  if (!created) {
    throw new Error('Failed to insert workspace fixture into database');
  }

  return created;
}
