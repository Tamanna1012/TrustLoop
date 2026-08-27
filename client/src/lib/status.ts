import type { CircleStatus, CycleStatus } from '@/types/circle';
import type { BadgeProps } from '@/components/ui/Badge';

type Tone = NonNullable<BadgeProps['tone']>;

export const circleStatusTone: Record<CircleStatus, Tone> = {
  forming: 'accent',
  active: 'primary',
  completed: 'success',
  cancelled: 'destructive',
};

export const circleStatusLabel: Record<CircleStatus, string> = {
  forming: 'Forming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const cycleStatusTone: Record<CycleStatus, Tone> = {
  pending: 'neutral',
  collecting: 'accent',
  completed: 'success',
};

export const cycleStatusLabel: Record<CycleStatus, string> = {
  pending: 'Pending',
  collecting: 'Collecting',
  completed: 'Completed',
};
