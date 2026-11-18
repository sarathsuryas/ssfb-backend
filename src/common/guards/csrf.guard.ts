import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { CSRF_COOKIE } from '../cookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    // Browser-supplied bearer tokens can't be sent cross-site; only cookies need CSRF protection.
    if (request.headers.authorization) {
      return true;
    }

    const path = (request.originalUrl ?? request.url).split('?')[0];
    if (path.endsWith('/auth/login')) {
      return true;
    }

    const cookieToken = request.cookies?.[CSRF_COOKIE];
    const headerToken = request.headers['x-csrf-token'];

    if (
      typeof cookieToken !== 'string' ||
      typeof headerToken !== 'string' ||
      !tokensMatch(cookieToken, headerToken)
    ) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

function tokensMatch(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
