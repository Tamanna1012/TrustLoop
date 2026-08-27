import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import * as notifications from '@/lib/notifications';

// Polling, not a websocket — see decision D3 (no Socket.io until it's
// actually needed). A 30s interval is plenty for "you got a payout" alerts.
export function useNotifications() {
  const isAuthed = useAuthStore((s) => !!s.user);
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notifications.listNotificationsRequest,
    enabled: isAuthed,
    refetchInterval: 30_000,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notifications.markAllNotificationsReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
