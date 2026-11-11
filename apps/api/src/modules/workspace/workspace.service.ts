import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';
import * as crypto from 'node:crypto';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { Database } from '../../database/database.module';
import * as schema from '../../database/schema';
import { IdentityService } from '../identity';

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

export interface WorkspaceBootstrapResponse {
  workspace: {
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  membership: {
    role: string;
    status: string;
    joinedAt: Date;
  };
  counts: {
    memberCount: number;
    pendingInviteCount: number;
  };
  accessibleWorkspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

export interface CreateInvitationInput {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface WorkspaceInvitationResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  token?: string;
  createdAt: Date;
}

export interface InvitationDetailsResponse {
  id: string;
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  expiresAt: Date;
}

export interface WorkspaceMemberResponse {
  id: string;
  accountId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateMemberInput {
  role?: 'ADMIN' | 'MEMBER';
  status?: 'ACTIVE' | 'SUSPENDED';
}

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly identityService: IdentityService,
  ) {}

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

    // Verify membership is active
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
   * Bootstraps workspace context for client initialization in a single round-trip.
   * Enforces that the calling account has an ACTIVE membership in the workspace.
   */
  async bootstrapWorkspace(accountId: string, slug: string): Promise<WorkspaceBootstrapResponse> {
    const normalizedSlug = slug.trim().toLowerCase();

    // 1. Fetch workspace
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

    // 2. Fetch active membership
    const [membership] = await this.db
      .select()
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
          eq(schema.workspaceMemberships.accountId, accountId),
        ),
      )
      .limit(1);

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('You do not have active access to this workspace.');
    }

    // 3. Fetch counts in parallel
    const [memberCountRes] = await this.db
      .select({ total: count() })
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
          eq(schema.workspaceMemberships.status, 'ACTIVE'),
        ),
      );

    const [pendingInviteCountRes] = await this.db
      .select({ total: count() })
      .from(schema.workspaceInvitations)
      .where(
        and(
          eq(schema.workspaceInvitations.workspaceId, workspace.id),
          eq(schema.workspaceInvitations.status, 'PENDING'),
        ),
      );

    // 4. Fetch all active accessible workspaces for this account
    const accessibleWorkspaces = await this.listUserWorkspaces(accountId);

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        status: workspace.status,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
      membership: {
        role: membership.role,
        status: membership.status,
        joinedAt: membership.createdAt,
      },
      counts: {
        memberCount: Number(memberCountRes?.total ?? 0),
        pendingInviteCount: Number(pendingInviteCountRes?.total ?? 0),
      },
      accessibleWorkspaces: accessibleWorkspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        role: w.role,
      })),
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

  /**
   * Creates an invitation for an email address with single-use hashed token.
   */
  async createInvitation(
    accountId: string,
    slug: string,
    input: CreateInvitationInput,
  ): Promise<WorkspaceInvitationResponse> {
    const workspace = await this.getWorkspaceBySlug(accountId, slug);

    if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
      throw new ForbiddenException('Only workspace owners and administrators can invite members.');
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new BadRequestException('A valid email address is required.');
    }

    // Verify target email is not already an active member of this workspace
    const [existingMember] = await this.db
      .select({ id: schema.workspaceMemberships.id })
      .from(schema.workspaceMemberships)
      .innerJoin(schema.accounts, eq(schema.workspaceMemberships.accountId, schema.accounts.id))
      .where(
        and(
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
          eq(schema.accounts.email, normalizedEmail),
          eq(schema.workspaceMemberships.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (existingMember) {
      throw new ConflictException(
        'A user with this email address is already an active member of this workspace.',
      );
    }

    // Revoke any existing pending invitations for this email in this workspace
    const [existingPending] = await this.db
      .select({ id: schema.workspaceInvitations.id })
      .from(schema.workspaceInvitations)
      .where(
        and(
          eq(schema.workspaceInvitations.workspaceId, workspace.id),
          eq(schema.workspaceInvitations.email, normalizedEmail),
          eq(schema.workspaceInvitations.status, 'PENDING'),
        ),
      )
      .limit(1);

    if (existingPending) {
      await this.db
        .update(schema.workspaceInvitations)
        .set({ status: 'REVOKED' })
        .where(eq(schema.workspaceInvitations.id, existingPending.id));
    }

    // Generate cryptographic token and SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day expiration

    const [invitation] = await this.db
      .insert(schema.workspaceInvitations)
      .values({
        workspaceId: workspace.id,
        email: normalizedEmail,
        role: input.role ?? 'MEMBER',
        tokenHash,
        invitedByAccountId: accountId,
        status: 'PENDING',
        expiresAt,
      })
      .returning();

    if (!invitation) {
      throw new Error('Failed to create invitation.');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      token: rawToken,
      createdAt: invitation.createdAt,
    };
  }

  /**
   * Lists all invitations for a workspace. Enforces OWNER or ADMIN role.
   */
  async listInvitations(accountId: string, slug: string): Promise<WorkspaceInvitationResponse[]> {
    const workspace = await this.getWorkspaceBySlug(accountId, slug);

    if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only workspace owners and administrators can view workspace invitations.',
      );
    }

    const rows = await this.db
      .select({
        id: schema.workspaceInvitations.id,
        email: schema.workspaceInvitations.email,
        role: schema.workspaceInvitations.role,
        status: schema.workspaceInvitations.status,
        expiresAt: schema.workspaceInvitations.expiresAt,
        createdAt: schema.workspaceInvitations.createdAt,
      })
      .from(schema.workspaceInvitations)
      .where(eq(schema.workspaceInvitations.workspaceId, workspace.id))
      .orderBy(desc(schema.workspaceInvitations.createdAt));

    return rows;
  }

  /**
   * Revokes a pending workspace invitation.
   */
  async revokeInvitation(
    accountId: string,
    slug: string,
    invitationId: string,
  ): Promise<WorkspaceInvitationResponse> {
    const workspace = await this.getWorkspaceBySlug(accountId, slug);

    if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only workspace owners and administrators can revoke invitations.',
      );
    }

    const [invitation] = await this.db
      .select()
      .from(schema.workspaceInvitations)
      .where(
        and(
          eq(schema.workspaceInvitations.id, invitationId),
          eq(schema.workspaceInvitations.workspaceId, workspace.id),
        ),
      )
      .limit(1);

    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot revoke an invitation that is ${invitation.status.toLowerCase()}.`,
      );
    }

    const [updated] = await this.db
      .update(schema.workspaceInvitations)
      .set({ status: 'REVOKED' })
      .where(eq(schema.workspaceInvitations.id, invitationId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Invitation not found.');
    }

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      expiresAt: updated.expiresAt,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Resolves invitation details by unhashed token for display to recipient.
   */
  async getInvitationByToken(rawToken: string): Promise<InvitationDetailsResponse> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [record] = await this.db
      .select({
        invitation: schema.workspaceInvitations,
        workspace: {
          id: schema.workspaces.id,
          name: schema.workspaces.name,
          slug: schema.workspaces.slug,
        },
      })
      .from(schema.workspaceInvitations)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceInvitations.workspaceId, schema.workspaces.id),
      )
      .where(eq(schema.workspaceInvitations.tokenHash, tokenHash))
      .limit(1);

    if (!record) {
      throw new NotFoundException('Invitation not found.');
    }

    if (record.invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `This invitation is no longer valid (${record.invitation.status.toLowerCase()}).`,
      );
    }

    // Check expiration
    if (new Date() > record.invitation.expiresAt) {
      await this.db
        .update(schema.workspaceInvitations)
        .set({ status: 'EXPIRED' })
        .where(eq(schema.workspaceInvitations.id, record.invitation.id));
      throw new BadRequestException('This invitation has expired.');
    }

    return {
      id: record.invitation.id,
      email: record.invitation.email,
      role: record.invitation.role,
      workspace: record.workspace,
      expiresAt: record.invitation.expiresAt,
    };
  }

  /**
   * Accepts an invitation, binding it to the authenticated caller's identity.
   */
  async acceptInvitation(
    accountId: string,
    rawToken: string,
  ): Promise<{ workspace: { id: string; name: string; slug: string }; role: string }> {
    const account = await this.identityService.getAccountById(accountId);
    if (!account) {
      throw new UnauthorizedException('Authenticated account not found.');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [record] = await this.db
      .select({
        invitation: schema.workspaceInvitations,
        workspace: schema.workspaces,
      })
      .from(schema.workspaceInvitations)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceInvitations.workspaceId, schema.workspaces.id),
      )
      .where(eq(schema.workspaceInvitations.tokenHash, tokenHash))
      .limit(1);

    if (!record) {
      throw new NotFoundException('Invitation not found.');
    }

    if (record.invitation.status === 'ACCEPTED') {
      throw new ConflictException('This invitation has already been accepted.');
    }

    if (record.invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `This invitation is no longer valid (${record.invitation.status.toLowerCase()}).`,
      );
    }

    if (new Date() > record.invitation.expiresAt) {
      await this.db
        .update(schema.workspaceInvitations)
        .set({ status: 'EXPIRED' })
        .where(eq(schema.workspaceInvitations.id, record.invitation.id));
      throw new BadRequestException('This invitation has expired.');
    }

    // Identity binding: must match invitation recipient email
    if (account.email.toLowerCase() !== record.invitation.email.toLowerCase()) {
      throw new ForbiddenException(
        `This invitation was issued to ${record.invitation.email}. You are signed in as ${account.email}.`,
      );
    }

    // Atomic transaction: create/reactivate membership and accept invitation
    return await this.db.transaction(async (tx) => {
      const [existingMembership] = await tx
        .select()
        .from(schema.workspaceMemberships)
        .where(
          and(
            eq(schema.workspaceMemberships.workspaceId, record.workspace.id),
            eq(schema.workspaceMemberships.accountId, account.id),
          ),
        )
        .limit(1);

      if (existingMembership) {
        if (existingMembership.status === 'ACTIVE') {
          // Already active member, update invitation to accepted
          await tx
            .update(schema.workspaceInvitations)
            .set({ status: 'ACCEPTED', acceptedAt: new Date() })
            .where(eq(schema.workspaceInvitations.id, record.invitation.id));

          return {
            workspace: {
              id: record.workspace.id,
              name: record.workspace.name,
              slug: record.workspace.slug,
            },
            role: existingMembership.role,
          };
        }

        // Reactivate previously suspended/inactive membership
        await tx
          .update(schema.workspaceMemberships)
          .set({
            status: 'ACTIVE',
            role: record.invitation.role,
            updatedAt: new Date(),
          })
          .where(eq(schema.workspaceMemberships.id, existingMembership.id));
      } else {
        await tx.insert(schema.workspaceMemberships).values({
          workspaceId: record.workspace.id,
          accountId: account.id,
          role: record.invitation.role,
          status: 'ACTIVE',
        });
      }

      await tx
        .update(schema.workspaceInvitations)
        .set({ status: 'ACCEPTED', acceptedAt: new Date() })
        .where(eq(schema.workspaceInvitations.id, record.invitation.id));

      return {
        workspace: {
          id: record.workspace.id,
          name: record.workspace.name,
          slug: record.workspace.slug,
        },
        role: record.invitation.role,
      };
    });
  }

  /**
   * Lists all members of a workspace. Gated to active workspace members.
   */
  async listMembers(accountId: string, slug: string): Promise<WorkspaceMemberResponse[]> {
    const workspace = await this.getWorkspaceBySlug(accountId, slug);

    const rows = await this.db
      .select({
        id: schema.workspaceMemberships.id,
        accountId: schema.accounts.id,
        displayName: schema.accounts.displayName,
        email: schema.accounts.email,
        avatarUrl: schema.accounts.avatarUrl,
        role: schema.workspaceMemberships.role,
        status: schema.workspaceMemberships.status,
        createdAt: schema.workspaceMemberships.createdAt,
        updatedAt: schema.workspaceMemberships.updatedAt,
      })
      .from(schema.workspaceMemberships)
      .innerJoin(schema.accounts, eq(schema.workspaceMemberships.accountId, schema.accounts.id))
      .where(eq(schema.workspaceMemberships.workspaceId, workspace.id))
      .orderBy(schema.workspaceMemberships.createdAt);

    return rows;
  }

  /**
   * Updates a member's role or status. Enforces OWNER/ADMIN authorization and sole-owner invariants.
   */
  async updateMember(
    callerAccountId: string,
    slug: string,
    memberId: string,
    input: UpdateMemberInput,
  ): Promise<WorkspaceMemberResponse> {
    const workspace = await this.getWorkspaceBySlug(callerAccountId, slug);

    if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
      throw new ForbiddenException('Only workspace owners and administrators can manage members.');
    }

    const [targetMember] = await this.db
      .select({
        membership: schema.workspaceMemberships,
        account: schema.accounts,
      })
      .from(schema.workspaceMemberships)
      .innerJoin(schema.accounts, eq(schema.workspaceMemberships.accountId, schema.accounts.id))
      .where(
        and(
          eq(schema.workspaceMemberships.id, memberId),
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
        ),
      )
      .limit(1);

    if (!targetMember) {
      throw new NotFoundException('Member not found.');
    }

    // Role-based hierarchy enforcement:
    // If target is OWNER, only another OWNER can modify them.
    if (targetMember.membership.role === 'OWNER' && workspace.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can modify an owner membership.');
    }

    // If caller is ADMIN, they cannot modify another ADMIN or OWNER
    if (workspace.role === 'ADMIN' && targetMember.membership.role === 'ADMIN') {
      throw new ForbiddenException('Administrators cannot modify other administrators.');
    }

    // Sole owner invariant (BR-001/BR-003): cannot demote or suspend the sole owner
    if (
      targetMember.membership.role === 'OWNER' &&
      (Boolean(input.role) || (input.status && input.status !== 'ACTIVE'))
    ) {
      const activeOwners = await this.db
        .select({ id: schema.workspaceMemberships.id })
        .from(schema.workspaceMemberships)
        .where(
          and(
            eq(schema.workspaceMemberships.workspaceId, workspace.id),
            eq(schema.workspaceMemberships.role, 'OWNER'),
            eq(schema.workspaceMemberships.status, 'ACTIVE'),
          ),
        )
        .limit(2);

      if (activeOwners.length <= 1) {
        throw new BadRequestException('Cannot demote or suspend the sole owner of a workspace.');
      }
    }

    const updateValues: Partial<typeof schema.workspaceMemberships.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.role) {
      updateValues.role = input.role;
    }
    if (input.status) {
      updateValues.status = input.status;
    }

    const [updated] = await this.db
      .update(schema.workspaceMemberships)
      .set(updateValues)
      .where(eq(schema.workspaceMemberships.id, memberId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Member not found.');
    }

    return {
      id: updated.id,
      accountId: targetMember.account.id,
      displayName: targetMember.account.displayName,
      email: targetMember.account.email,
      avatarUrl: targetMember.account.avatarUrl,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Removes a member from the workspace. Enforces caller authorization and sole-owner invariants.
   */
  async removeMember(
    callerAccountId: string,
    slug: string,
    memberId: string,
  ): Promise<{ success: boolean; removedMemberId: string }> {
    const workspace = await this.getWorkspaceBySlug(callerAccountId, slug);

    const [targetMember] = await this.db
      .select({
        membership: schema.workspaceMemberships,
      })
      .from(schema.workspaceMemberships)
      .where(
        and(
          eq(schema.workspaceMemberships.id, memberId),
          eq(schema.workspaceMemberships.workspaceId, workspace.id),
        ),
      )
      .limit(1);

    if (!targetMember) {
      throw new NotFoundException('Member not found.');
    }

    const isSelfRemoval = targetMember.membership.accountId === callerAccountId;

    // Authorization check
    if (!isSelfRemoval) {
      if (workspace.role !== 'OWNER' && workspace.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only workspace owners and administrators can remove members.',
        );
      }
      if (workspace.role === 'ADMIN' && targetMember.membership.role === 'ADMIN') {
        throw new ForbiddenException('Administrators cannot remove other administrators.');
      }
      if (targetMember.membership.role === 'OWNER' && workspace.role !== 'OWNER') {
        throw new ForbiddenException('Only owners can remove an owner.');
      }
    }

    // Sole owner invariant: cannot remove sole owner
    if (targetMember.membership.role === 'OWNER') {
      const activeOwners = await this.db
        .select({ id: schema.workspaceMemberships.id })
        .from(schema.workspaceMemberships)
        .where(
          and(
            eq(schema.workspaceMemberships.workspaceId, workspace.id),
            eq(schema.workspaceMemberships.role, 'OWNER'),
            eq(schema.workspaceMemberships.status, 'ACTIVE'),
          ),
        )
        .limit(2);

      if (activeOwners.length <= 1) {
        throw new BadRequestException('Cannot remove the sole owner of a workspace.');
      }
    }

    await this.db
      .delete(schema.workspaceMemberships)
      .where(eq(schema.workspaceMemberships.id, memberId));

    return {
      success: true,
      removedMemberId: memberId,
    };
  }
}
