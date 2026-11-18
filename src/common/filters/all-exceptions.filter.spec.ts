import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

function mockHost(url: string) {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', url }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('uses the status and message of an HttpException', () => {
    const { host, status, json } = mockHost('/api/items');

    filter.catch(new HttpException('Bad input', HttpStatus.BAD_REQUEST), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad input',
        path: '/api/items',
      }),
    );
  });

  it('does not leak details of unexpected errors', () => {
    const { host, status, json } = mockHost('/api/items');

    filter.catch(new Error('database password is secret'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
