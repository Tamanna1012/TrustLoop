import type { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_COOKIE_NAME } from '../utils/cookies.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { toPublicUser } from '../utils/serializers.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 201, { user: toPublicUser(user), accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 200, { user: toPublicUser(user), accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  let payload: { id: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  sendSuccess(res, 200, { accessToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  sendSuccess(res, 200, { message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  sendSuccess(res, 200, { user: toPublicUser(user) });
});
