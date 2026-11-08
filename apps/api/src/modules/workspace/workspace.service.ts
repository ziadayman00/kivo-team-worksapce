import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { Database } from '../../database/database.module';
import * as schema from '../../database/schema';

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
}

export interface WorkspaceWithMembership {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkspaceService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /**
   * Helper to slugify a workspace name if no explicit slug is provided.
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Creates a new Workspace and immediately assigns the creator as OWNER within a transaction.
   */
  async createWorkspace(
    accountId: string,
    input: CreateWorkspaceInput,
  ): Promise<WorkspaceWithMembership> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Workspace name cannot be empty.');
    }

    const rawSlug = input.slug ? input.slug.trim().toLowerCase() : this.slugify(trimmedName);
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!rawSlug || !slugRegex.test(rawSlug)) {
      throw new BadRequestException(
        'Workspace slug must contain only lowercase alphanumeric characters and hyphens.',
      );
    }

    // Check slug uniqueness
    const [existing] = await this.db
      .select({ id: schema.workspaces.id })
      .from(schema.workspaces)
      .where(eq(schema.workspaces.slug, rawSlug))
      .limit(1);

    if (existing) {
      throw new ConflictException(`Workspace slug "${rawSlug}" is already in use.`);
    }

    // Atomic transaction: create workspace & owner membership
    return await this.db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(schema.workspaces)
        .values({
          name: trimmedName,
          slug: rawSlug,
          ownerAccountId: accountId,
          status: 'ACTIVE',
          authorizationVersion: 1,
        })
        .returning();

      if (!workspace) {
        throw new Error('Failed to create workspace.');
      }

      const [membership] = await tx
        .insert(schema.workspaceMemberships)
        .values({
          workspaceId: workspace.id,
          accountId,
          role: 'OWNER',
          status: 'ACTIVE',
        })
        .returning();

      if (!membership) {
        throw new Error('Failed to create workspace membership.');
      }

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        status: workspace.status,
        role: membership.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    });
  }

  /**
   * Lists all active workspaces where the given account is an active member.
   */
  async listUserWorkspaces(accountId: string): Promise<WorkspaceWithMembership[]> {
    const rows = await this.db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        slug: schema.workspaces.slug,
        status: schema.workspaces.status,
        role: schema.workspaceMemberships.role,
        createdAt: schema.workspaces.createdAt,
        updatedAt: schema.workspaces.updatedAt,
      })
      .from(schema.workspaceMemberships)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceMemberships.workspaceId, schema.workspaces.id),
      )
      .where(
        and(
          eq(schema.workspaceMemberships.accountId, accountId),
          eq(schema.workspaceMemberships.status, 'ACTIVE'),
          eq(schema.workspaces.status, 'ACTIVE'),
        ),
      );

    return rows;
  }

  /**
   * Retrieves workspace details by slug, ensuring the calling account has active membership.
   */
  async getWorkspaceBySlug(accountId: string, slug: string): Promise<WorkspaceWithMembership> {
    const normalizedSlug = slug.trim().toLowerCase();

    // Check if workspace exists
    const [workspace] = await this.db
      .select()
      .from(schema.workspaces)
      .where(
        and(eq(schema.workspaces.slug, normalizedSlug), eq(schema.workspaces.status, 'ACTIVE')),
      )
      .limit(1);

    if (!workspace) {
      throw new NotFoundException(`Workspace "${normalizedSlug}" not found.`);
    }

    // Verify membership
    const [membership] = await this.db
      .select()
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
          eq(schema.workspaceMemberships.accountId, accountId),
          eq(schema.workspaceMemberships.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status,
      role: membership.role,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  /**
   * Updates workspace settings (name). Enforces OWNER or ADMIN role.
   */
  async updateWorkspace(
    accountId: string,
    slug: string,
    input: UpdateWorkspaceInput,
  ): Promise<WorkspaceWithMembership> {
    const workspace = await this.getWorkspaceBySlug(accountId, slug);

    if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only workspace owners and administrators can modify workspace settings.',
      );
    }

    const updateValues: Partial<typeof schema.workspaces.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Workspace name cannot be empty.');
      }
      updateValues.name = trimmedName;
    }

    const [updated] = await this.db
      .update(schema.workspaces)
      .set(updateValues)
      .where(eq(schema.workspaces.id, workspace.id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Workspace not found.');
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      status: updated.status,
      role: workspace.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
