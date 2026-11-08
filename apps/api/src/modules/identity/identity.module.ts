import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

/**
 * IdentityModule
 * Owns global Accounts, authentication credentials, and session management.
 * Boundary: SD-13 / ADR-004 / ADR-010
 */
@Module({
  controllers: [AuthController],
  providers: [IdentityService, PasswordService, SessionService, AuthGuard],
  exports: [IdentityService, PasswordService, SessionService, AuthGuard],
})
export class IdentityModule {}
