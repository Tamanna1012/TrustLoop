import { Notification } from '../models/notification.model.js';

export type NotificationType = 'payout' | 'dispute_raised' | 'dispute_resolved';

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string
): Promise<void> {
  await Notification.create({ userId, type, message });
}
