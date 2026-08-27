import type { NextFunction, Request, Response } from 'express';
import { Circle } from '../models/circle.model.js';
import { Membership } from '../models/membership.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadCircle = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const circle = await Circle.findById(req.params.id);
  if (!circle) {
    throw ApiError.notFound('Circle not found');
  }
  req.circle = circle;
  next();
});

export function requireCircleAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.circle || !req.user || !req.circle.createdBy.equals(req.user.id)) {
    next(ApiError.forbidden('Only the circle admin can do this'));
    return;
  }
  next();
}

export const requireCircleMember = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const membership = await Membership.findOne({
    circleId: req.circle!._id,
    userId: req.user!.id,
    status: 'active'
  });
  if (!membership) {
    throw ApiError.forbidden('You are not a member of this circle');
  }
  req.membership = membership;
  next();
});
