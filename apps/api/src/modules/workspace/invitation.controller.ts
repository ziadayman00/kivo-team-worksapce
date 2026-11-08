import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard, AuthenticatedRequest } from '../identity';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /**
   * Public lookup for invitation details by token.
   */
  @Get(':token')
  @HttpCode(HttpStatus.OK)
  async getInvitation(@Param('token') token: string) {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Invitation token is required.');
    }

    const invitation = await this.workspaceService.getInvitationByToken(token.trim());
    return {
      status: 'success',
      data: { invitation },
    };
  }

  /**
   * Accepts an invitation, bound to the authenticated caller's identity.
   */
  @Post(':token/accept')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Param('token') token: string, @Req() req: AuthenticatedRequest) {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Invitation token is required.');
    }

    const result = await this.workspaceService.acceptInvitation(req.user.id, token.trim());
    return {
      status: 'success',
      data: result,
    };
  }
}
