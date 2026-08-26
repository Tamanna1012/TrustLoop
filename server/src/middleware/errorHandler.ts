import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Something went wrong';

  if (!isApiError) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: 'error',
    error: {
      message,
      details: isApiError ? err.details : undefined,
      stack: env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined
    }
  });
}
