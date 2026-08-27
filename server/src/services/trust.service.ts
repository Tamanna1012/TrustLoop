import { User } from '../models/user.model.js';

const ON_TIME_REWARD = 1;
const LATE_PENALTY = 5;

/**
 * A simple bounded random-walk: on-time contributions nudge the score up,
 * late ones knock it down harder than a single on-time payment earns back —
 * so a member has to be consistently reliable to hold a high score, but one
 * late payment doesn't tank it either.
 */
export async function adjustTrustScore(userId: string, wasLate: boolean): Promise<void> {
  const delta = wasLate ? -LATE_PENALTY : ON_TIME_REWARD;
  const user = await User.findById(userId);
  if (!user) return;

  user.trustScore = Math.min(100, Math.max(0, user.trustScore + delta));
  await user.save();
}
