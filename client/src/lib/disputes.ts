import { api } from './api';
import type { Dispute, DisputeStatus } from '@/types/dispute';

export async function listDisputesRequest(circleId: string) {
  const res = await api.get<{ data: { disputes: Dispute[] } }>(`/circles/${circleId}/disputes`);
  return res.data.data.disputes;
}

export async function createDisputeRequest(circleId: string, description: string) {
  const res = await api.post<{ data: { dispute: Dispute } }>(`/circles/${circleId}/disputes`, { description });
  return res.data.data.dispute;
}

export async function resolveDisputeRequest(
  circleId: string,
  disputeId: string,
  status: Extract<DisputeStatus, 'resolved' | 'rejected'>
) {
  const res = await api.patch<{ data: { dispute: Dispute } }>(`/circles/${circleId}/disputes/${disputeId}`, {
    status,
  });
  return res.data.data.dispute;
}
