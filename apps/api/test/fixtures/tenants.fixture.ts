import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../src/database/schema';
import { createWorkspaceFixture } from './workspaces.fixture';

export interface TestActor {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  workspaceId: string;
}

export interface TwoTenantFixture {
  alpha: {
    workspace: typeof schema.workspaces.$inferSelect;
    actors: {
      owner: TestActor;
      admin: TestActor;
      member: TestActor;
    };
  };
  beta: {
    workspace: typeof schema.workspaces.$inferSelect;
    actors: {
      owner: TestActor;
      member: TestActor;
    };
  };
}

export const WORKSPACE_ALPHA_ID = '11111111-1111-1111-1111-111111111111';
export const WORKSPACE_BETA_ID = '22222222-2222-2222-2222-222222222222';

export async function setupTwoTenantFixture(
  db: NodePgDatabase<typeof schema>,
): Promise<TwoTenantFixture> {
  const alphaWorkspace = await createWorkspaceFixture(db, {
    id: WORKSPACE_ALPHA_ID,
    name: 'Workspace Alpha',
    slug: 'workspace-alpha',
  });

  const betaWorkspace = await createWorkspaceFixture(db, {
    id: WORKSPACE_BETA_ID,
    name: 'Workspace Beta',
    slug: 'workspace-beta',
  });

  return {
    alpha: {
      workspace: alphaWorkspace,
      actors: {
        owner: {
          id: 'actor-alpha-owner',
          email: 'owner@alpha.test',
          role: 'OWNER',
          workspaceId: WORKSPACE_ALPHA_ID,
        },
        admin: {
          id: 'actor-alpha-admin',
          email: 'admin@alpha.test',
          role: 'ADMIN',
          workspaceId: WORKSPACE_ALPHA_ID,
        },
        member: {
          id: 'actor-alpha-member',
          email: 'member@alpha.test',
          role: 'MEMBER',
          workspaceId: WORKSPACE_ALPHA_ID,
        },
      },
    },
    beta: {
      workspace: betaWorkspace,
      actors: {
        owner: {
          id: 'actor-beta-owner',
          email: 'owner@beta.test',
          role: 'OWNER',
          workspaceId: WORKSPACE_BETA_ID,
        },
        member: {
          id: 'actor-beta-member',
          email: 'member@beta.test',
          role: 'MEMBER',
          workspaceId: WORKSPACE_BETA_ID,
        },
      },
    },
  };
}
