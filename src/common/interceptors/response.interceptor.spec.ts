import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ResponseInterceptor } from './response.interceptor.js';

describe('ResponseInterceptor', () => {
  it('wraps the handler payload in a data envelope', async () => {
    const interceptor = new ResponseInterceptor<{ id: number }>();
    const handler = { handle: () => of({ id: 1 }) } as CallHandler<{
      id: number;
    }>;

    const result = await firstValueFrom(
      interceptor.intercept({} as ExecutionContext, handler),
    );

    expect(result).toEqual({ data: { id: 1 } });
  });
});
