import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import {
  ACCESS_COOKIE,
  CSRF_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  authCookieOptions,
  csrfCookieOptions,
  clearAuthCookies,
} from '../common/cookies.js';
import { PrismaService } from '../database/prisma.service.js';
import type { User } from '../generated/prisma/client.js';
import {
  UsersService,
  type PublicUser,
} from '../modules/users/users.service.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.js';

const SALT_ROUNDS = 12;
const DEFAULT_REFRESH_TTL = 604800;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: LoginDto, res: Response): Promise<{ user: PublicUser }> {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueSession(user, res);
  }

  async refresh(
    refreshToken: string | undefined,
    res: Response,
  ): Promise<{ user: PublicUser }> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // A revoked token being replayed means it was likely stolen.
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(user, res);
  }

  async logout(
    refreshToken: string | undefined,
    res: Response,
  ): Promise<{ success: true }> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    clearAuthCookies(res, this.cookiesSecure);
    return { success: true };
  }

  async me(userId: string): Promise<{ user: PublicUser }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user: this.usersService.toPublicUser(user) };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    res: Response,
  ): Promise<{ user: PublicUser }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const updated = await this.usersService.updatePassword(
      user.id,
      await bcrypt.hash(dto.newPassword, SALT_ROUNDS),
    );

    // Invalidate every existing session, then give the current device a fresh one.
    await this.revokeAllForUser(user.id);
    return this.issueSession(updated, res);
  }

  private async issueSession(
    user: User,
    res: Response,
  ): Promise<{ user: PublicUser }> {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    } satisfies JwtPayload);

    const decoded = this.jwtService.decode(accessToken) as { exp: number };
    const accessMaxAge = Math.max(0, decoded.exp * 1000 - Date.now());

    const refreshToken = randomBytes(32).toString('hex');
    const refreshTtl = this.refreshTtlSeconds;
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    const csrfToken = randomBytes(32).toString('hex');
    const secure = this.cookiesSecure;

    res.cookie(
      ACCESS_COOKIE,
      accessToken,
      authCookieOptions(secure, accessMaxAge, '/'),
    );
    res.cookie(
      REFRESH_COOKIE,
      refreshToken,
      authCookieOptions(secure, refreshTtl * 1000, REFRESH_COOKIE_PATH),
    );
    res.cookie(
      CSRF_COOKIE,
      csrfToken,
      csrfCookieOptions(secure, refreshTtl * 1000),
    );

    return { user: this.usersService.toPublicUser(user) };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private get cookiesSecure(): boolean {
    return this.config.get<boolean>('cookies.secure') ?? false;
  }

  private get refreshTtlSeconds(): number {
    return (
      this.config.get<number>('jwt.refreshTtlSeconds') ?? DEFAULT_REFRESH_TTL
    );
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
