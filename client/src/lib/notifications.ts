import { api } from './api';
import type { AppNotification } from '@/types/notification';

export async function listNotificationsRequest() {
  const res = await api.get<{ data: { notifications: AppNotification[] } }>('/notifications');
  return res.data.data.notifications;
}

export async function markAllNotificationsReadRequest() {
  await api.patch('/notifications/read-all');
}
