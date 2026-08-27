import type { Response } from 'express';
import { env } from '../config/env.js';
import { parseDurationToMs } from './duration.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

export { REFRESH_COOKIE_NAME };
