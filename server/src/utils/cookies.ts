import type { Response } from 'express';
import { env } from '../config/env.js';
import { parseDurationToMs } from './duration.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

// In production the frontend (Vercel) and backend (Render/Railway) are on
// different registrable domains — a genuinely cross-site request from the
// browser's point of view. `sameSite: 'strict'` (or 'lax') would silently
// stop the browser from ever attaching this cookie to those requests,
// breaking the refresh flow entirely with no error to point at. Browsers
// require `secure: true` whenever `sameSite: 'none'` is used, which lines
// up with `secure` already being true in production.
const isProduction = env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
  path: '/api/auth'
};

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
}

export { REFRESH_COOKIE_NAME };
