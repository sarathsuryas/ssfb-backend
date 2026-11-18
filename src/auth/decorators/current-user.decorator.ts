import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../../modules/users/users.service.js';

/** The authenticated user attached by JwtStrategy. Only usable on protected routes. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: PublicUser }>();
    return request.user as PublicUser;
  },
);
