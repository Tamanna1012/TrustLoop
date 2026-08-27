import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // A malformed id in a URL (e.g. /circles/not-an-id) throws a Mongoose
  // CastError before it ever reaches app logic — that's a client mistake,
  // not a server failure, so it belongs at 400, not a bare 500.
  const isCastError = err instanceof mongoose.Error.CastError;
  const resolvedErr = isCastError ? ApiError.badRequest(`Invalid id: ${err.value}`) : err;

  const isApiError = resolvedErr instanceof ApiError;
  const statusCode = isApiError ? resolvedErr.statusCode : 500;
  const message = isApiError ? resolvedErr.message : 'Something went wrong';

  if (!isApiError) {
    console.error(resolvedErr);
  }

  res.status(statusCode).json({
    status: 'error',
    error: {
      message,
      details: isApiError ? resolvedErr.details : undefined,
      stack: env.NODE_ENV === 'development' && resolvedErr instanceof Error ? resolvedErr.stack : undefined
    }
  });
}
