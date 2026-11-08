import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { WorkspaceService } from './workspace.service';
import { AuthGuard, AuthenticatedRequest } from '../identity';

const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required.')
    .max(64, 'Workspace name cannot exceed 64 characters.'),
  slug: z
    .string()
    .min(2, 'Workspace slug must be at least 2 characters.')
    .max(48, 'Workspace slug cannot exceed 48 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    )
    .optional(),
});

const UpdateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name cannot be empty.')
    .max(64, 'Workspace name cannot exceed 64 characters.')
    .optional(),
});

const CreateInvitationSchema = z.object({
  email: z.string().email('A valid email address is required.'),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

const UpdateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const parseResult = CreateWorkspaceSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(firstIssue ? firstIssue.message : 'Invalid request data.');
    }

    const workspace = await this.workspaceService.createWorkspace(req.user.id, parseResult.data);
    return {
      status: 'success',
      data: { workspace },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listUserWorkspaces(@Req() req: AuthenticatedRequest) {
    const workspaces = await this.workspaceService.listUserWorkspaces(req.user.id);
    return {
      status: 'success',
      data: { workspaces },
    };
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async getWorkspaceBySlug(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    const workspace = await this.workspaceService.getWorkspaceBySlug(req.user.id, slug);
    return {
      status: 'success',
      data: { workspace },
    };
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  async updateWorkspace(
    @Param('slug') slug: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const parseResult = UpdateWorkspaceSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(firstIssue ? firstIssue.message : 'Invalid request data.');
    }

    const workspace = await this.workspaceService.updateWorkspace(
      req.user.id,
      slug,
      parseResult.data,
    );
    return {
      status: 'success',
      data: { workspace },
    };
  }

  /**
   * Invitations management
   */
  @Post(':slug/invitations')
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @Param('slug') slug: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const parseResult = CreateInvitationSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(
        firstIssue ? firstIssue.message : 'Invalid invitation request.',
      );
    }

    const invitation = await this.workspaceService.createInvitation(
      req.user.id,
      slug,
      parseResult.data,
    );
    return {
      status: 'success',
      data: { invitation },
    };
  }

  @Get(':slug/invitations')
  @HttpCode(HttpStatus.OK)
  async listInvitations(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    const invitations = await this.workspaceService.listInvitations(req.user.id, slug);
    return {
      status: 'success',
      data: { invitations },
    };
  }

  @Post(':slug/invitations/:invitationId/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeInvitation(
    @Param('slug') slug: string,
    @Param('invitationId') invitationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const invitation = await this.workspaceService.revokeInvitation(
      req.user.id,
      slug,
      invitationId,
    );
    return {
      status: 'success',
      data: { invitation },
    };
  }

  /**
   * Members management
   */
  @Get(':slug/members')
  @HttpCode(HttpStatus.OK)
  async listMembers(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    const members = await this.workspaceService.listMembers(req.user.id, slug);
    return {
      status: 'success',
      data: { members },
    };
  }

  @Patch(':slug/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async updateMember(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const parseResult = UpdateMemberSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(firstIssue ? firstIssue.message : 'Invalid member update.');
    }

    const member = await this.workspaceService.updateMember(
      req.user.id,
      slug,
      memberId,
      parseResult.data,
    );
    return {
      status: 'success',
      data: { member },
    };
  }

  @Delete(':slug/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.workspaceService.removeMember(req.user.id, slug, memberId);
    return {
      status: 'success',
      data: result,
    };
  }
}
