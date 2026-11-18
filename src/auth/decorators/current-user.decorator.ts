import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../../modules/users/users.service.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: PublicUser }>();
    return request.user;
  },
);
