import type { Request, Response } from 'express';
import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, 200, { notifications });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user!.id },
    { isRead: true }
  );
  sendSuccess(res, 200, { message: 'Marked as read' });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
  sendSuccess(res, 200, { message: 'All marked as read' });
});
