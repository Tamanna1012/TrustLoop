import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adjustTrustScore } from './trust.service.js';
import { User } from '../models/user.model.js';

vi.mock('../models/user.model.js', () => ({
  User: { findById: vi.fn() },
}));

const mockedFindById = vi.mocked(User.findById);

describe('adjustTrustScore', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adds 1 point for an on-time contribution', async () => {
    const user = { trustScore: 90, save: vi.fn() };
    mockedFindById.mockResolvedValue(user as never);

    await adjustTrustScore('u1', false);

    expect(user.trustScore).toBe(91);
    expect(user.save).toHaveBeenCalledOnce();
  });

  it('clamps at 100 so on-time contributions never push a score above the ceiling', async () => {
    const user = { trustScore: 100, save: vi.fn() };
    mockedFindById.mockResolvedValue(user as never);

    await adjustTrustScore('u1', false);

    expect(user.trustScore).toBe(100);
  });

  it('subtracts 5 points for a late contribution — a bigger penalty than the reward', async () => {
    const user = { trustScore: 80, save: vi.fn() };
    mockedFindById.mockResolvedValue(user as never);

    await adjustTrustScore('u1', true);

    expect(user.trustScore).toBe(75);
  });

  it('clamps at 0 rather than going negative', async () => {
    const user = { trustScore: 3, save: vi.fn() };
    mockedFindById.mockResolvedValue(user as never);

    await adjustTrustScore('u1', true);

    expect(user.trustScore).toBe(0);
  });

  it('does nothing if the user no longer exists', async () => {
    mockedFindById.mockResolvedValue(null);

    await expect(adjustTrustScore('missing', false)).resolves.toBeUndefined();
  });
});
