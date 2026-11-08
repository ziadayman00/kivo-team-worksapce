import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { InvitationController } from './invitation.controller';
import { IdentityModule } from '../identity';

/**
 * WorkspaceModule
 * Owns Workspaces, Workspace Memberships, and Invitations.
 * Boundary: SD-13
 */
@Module({
  imports: [IdentityModule],
  controllers: [WorkspaceController, InvitationController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
