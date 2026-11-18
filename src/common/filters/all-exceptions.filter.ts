import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, error } = this.describe(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed: ${JSON.stringify(message)}`,
      );
      if (!(exception instanceof HttpException)) {
        this.logger.error(
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private describe(
    exception: unknown,
    status: number,
  ): { message: string | string[]; error?: string } {
    if (!(exception instanceof HttpException)) {
      return {
        message: 'Internal server error',
        error: HttpStatus[status],
      };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { message: payload, error: HttpStatus[status] };
    }

    if (payload && typeof payload === 'object') {
      const body = payload as Record<string, unknown>;
      const message =
        typeof body.message === 'string' || Array.isArray(body.message)
          ? (body.message as string | string[])
          : HttpStatus[status];
      const error =
        typeof body.error === 'string' ? body.error : HttpStatus[status];

      return { message, error };
    }

    return { message: HttpStatus[status], error: HttpStatus[status] };
  }
}
