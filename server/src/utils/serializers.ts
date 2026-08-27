import type { UserDoc } from '../models/user.model.js';

export function toPublicUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    trustScore: user.trustScore,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt
  };
}
