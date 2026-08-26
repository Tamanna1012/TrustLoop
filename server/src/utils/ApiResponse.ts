import type { Response } from 'express';

export function sendSuccess<T>(res: Response, statusCode: number, data: T): void {
  res.status(statusCode).json({ status: 'success', data });
}
