export type CircleStatus = 'forming' | 'active' | 'completed' | 'cancelled';
export type CycleStatus = 'pending' | 'collecting' | 'completed';
export type TransactionType = 'contribution' | 'payout';

export interface Circle {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  contributionAmount: number;
  cycleFrequency: 'weekly' | 'monthly';
  maxMembers: number;
  status: CircleStatus;
  payoutMethod: 'roundRobin' | 'bidding';
  startDate?: string;
  inviteCode: string;
  createdAt: string;
}

export interface Member {
  _id: string;
  userId: { _id: string; name: string; avatarUrl: string | null; trustScore: number };
  payoutPosition: number;
  hasReceivedPayout: boolean;
  status: 'active' | 'left' | 'removed';
}

export interface Cycle {
  _id: string;
  circleId: string;
  cycleNumber: number;
  dueDate: string;
  payoutRecipient: { _id: string; name: string; avatarUrl: string | null } | string;
  status: CycleStatus;
  totalCollected: number;
}

export interface LedgerTransaction {
  _id: string;
  circleId: string;
  cycleId: string;
  userId: { _id: string; name: string; avatarUrl: string | null } | string;
  type: TransactionType;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
