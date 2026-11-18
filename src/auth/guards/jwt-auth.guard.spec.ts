import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const executionContext = () =>
  ({
    getHandler: () => () => {},
    getClass: () => class {},
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('skips authentication for @Public() routes', () => {
    const superCanActivate = vi
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(executionContext())).toBe(true);
    expect(superCanActivate).not.toHaveBeenCalled();
  });

  it('delegates to the JWT guard for protected routes', () => {
    const superCanActivate = vi
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(executionContext())).toBe(true);
    expect(superCanActivate).toHaveBeenCalledOnce();
  });
});
