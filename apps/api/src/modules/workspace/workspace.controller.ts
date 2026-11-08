import {
  Controller,
  Post,
  Get,
  Patch,
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
}
