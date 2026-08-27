export type DisputeStatus = 'open' | 'underReview' | 'resolved' | 'rejected';

interface DisputeUser {
  _id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Dispute {
  _id: string;
  circleId: string;
  raisedBy: DisputeUser | string;
  againstUser?: DisputeUser | string;
  description: string;
  status: DisputeStatus;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
}
