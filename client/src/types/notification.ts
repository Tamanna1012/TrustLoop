export type NotificationType = 'payout' | 'dispute_raised' | 'dispute_resolved';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
