import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../strategies/jwt.strategy.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    return request.user;
  },
);
