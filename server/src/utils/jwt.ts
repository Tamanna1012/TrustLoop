import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  role: 'user' | 'platformAdmin';
}

export function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as jwt.SignOptions);
}

export function signRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AuthenticatedUser {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  return { id: payload.sub as string, role: payload.role as AuthenticatedUser['role'] };
}

export function verifyRefreshToken(token: string): Pick<AuthenticatedUser, 'id'> {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  return { id: payload.sub as string };
}
