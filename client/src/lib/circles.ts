import { api } from './api';
import type { Circle, Member, Cycle, LedgerTransaction } from '@/types/circle';

export interface CreateCircleInput {
  name: string;
  description?: string;
  contributionAmount: number;
  cycleFrequency: 'weekly' | 'monthly';
  maxMembers: number;
}

export interface MyCircleEntry {
  circle: Circle;
  payoutPosition: number;
  hasReceivedPayout: boolean;
}

export async function createCircleRequest(input: CreateCircleInput) {
  const res = await api.post<{ data: { circle: Circle } }>('/circles', input);
  return res.data.data.circle;
}

export async function listMyCirclesRequest() {
  const res = await api.get<{ data: { circles: MyCircleEntry[] } }>('/circles');
  return res.data.data.circles;
}

export async function joinCircleRequest(inviteCode: string) {
  const res = await api.post<{ data: { circle: Circle } }>('/circles/join', { inviteCode });
  return res.data.data.circle;
}

export async function getCircleRequest(id: string) {
  const res = await api.get<{ data: { circle: Circle } }>(`/circles/${id}`);
  return res.data.data.circle;
}

export async function listMembersRequest(circleId: string) {
  const res = await api.get<{ data: { members: Member[] } }>(`/circles/${circleId}/members`);
  return res.data.data.members;
}

export async function listCyclesRequest(circleId: string) {
  const res = await api.get<{ data: { cycles: Cycle[] } }>(`/circles/${circleId}/cycles`);
  return res.data.data.cycles;
}

export async function listTransactionsRequest(circleId: string) {
  const res = await api.get<{ data: { transactions: LedgerTransaction[] } }>(
    `/circles/${circleId}/transactions`
  );
  return res.data.data.transactions;
}

export async function activateCircleRequest(circleId: string) {
  const res = await api.post<{ data: { circle: Circle } }>(`/circles/${circleId}/activate`);
  return res.data.data.circle;
}

export async function recordContributionRequest(circleId: string, cycleId: string, userId: string) {
  const res = await api.post(`/circles/${circleId}/cycles/${cycleId}/contributions`, { userId });
  return res.data.data;
}
