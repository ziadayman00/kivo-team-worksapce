import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from './session.service';
import * as schema from '../../database/schema';

export interface AuthenticatedRequest extends Request {
  user: typeof schema.accounts.$inferSelect;
  session: typeof schema.userSessions.$inferSelect;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required. Missing session.');
    }

    const result = await this.sessionService.validateSession(token);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    request.user = result.account;
    request.session = result.session;
    return true;
  }

  private extractToken(request: Request): string | null {
    // 1. Check HTTP-only cookie first
    if (request.cookies && typeof request.cookies['kivo_session'] === 'string') {
      return request.cookies['kivo_session'];
    }

    // 2. Check Bearer Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return null;
  }
}
