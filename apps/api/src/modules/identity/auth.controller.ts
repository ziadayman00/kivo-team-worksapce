import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { z } from 'zod';
import { IdentityService } from './identity.service';
import { AuthGuard, AuthenticatedRequest } from './auth.guard';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password is too long.'),
  displayName: z
    .string()
    .min(1, 'Display name is required.')
    .max(100, 'Display name cannot exceed 100 characters.'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.'),
});

const SESSION_COOKIE_NAME = 'kivo_session';
const SESSION_TTL_DAYS = 7;

@Controller('auth')
export class AuthController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: unknown) {
    const parseResult = RegisterSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(firstIssue ? firstIssue.message : 'Invalid request data.');
    }

    const account = await this.identityService.register(parseResult.data);
    return {
      status: 'success',
      data: { account },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new BadRequestException(firstIssue ? firstIssue.message : 'Invalid request data.');
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.identityService.login({
      ...parseResult.data,
      ipAddress,
      userAgent,
    });

    // Set secure HTTP-only session cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    return {
      status: 'success',
      data: {
        account: result.account,
        token: result.sessionToken, // Also return in body for non-browser/API clients
        expiresAt: result.expiresAt,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token =
      req.cookies?.[SESSION_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7)
        : null);

    if (token) {
      await this.identityService.logout(token);
    }

    // Clear cookie
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return {
      status: 'success',
      message: 'Logged out successfully.',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: AuthenticatedRequest) {
    return {
      status: 'success',
      data: {
        account: {
          id: req.user.id,
          email: req.user.email,
          displayName: req.user.displayName,
          avatarUrl: req.user.avatarUrl,
          createdAt: req.user.createdAt,
        },
      },
    };
  }
}
