import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordContribution } from './contribution.service.js';
import { Circle } from '../models/circle.model.js';
import { Cycle } from '../models/cycle.model.js';
import { Membership } from '../models/membership.model.js';
import { Transaction } from '../models/transaction.model.js';
import { adjustTrustScore } from './trust.service.js';
import { createNotification } from './notification.service.js';

vi.mock('../models/circle.model.js', () => ({
  Circle: { findById: vi.fn(), updateOne: vi.fn() },
}));
vi.mock('../models/cycle.model.js', () => ({
  Cycle: { findOne: vi.fn() },
}));
vi.mock('../models/membership.model.js', () => ({
  Membership: { findOne: vi.fn(), countDocuments: vi.fn(), updateOne: vi.fn() },
}));
vi.mock('../models/transaction.model.js', () => ({
  Transaction: { create: vi.fn() },
}));
vi.mock('./trust.service.js', () => ({ adjustTrustScore: vi.fn() }));
vi.mock('./notification.service.js', () => ({ createNotification: vi.fn() }));

const circle = { _id: 'c1', name: 'Hostel Fund', contributionAmount: 100 };
const membership = { _id: 'm1', circleId: 'c1', userId: 'u1', status: 'active' };

function makeCycle(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: 'cy1',
    circleId: 'c1',
    cycleNumber: 1,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // due tomorrow — on time
    payoutRecipient: 'u1',
    status: 'collecting',
    totalCollected: 0,
    save: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Circle.findById).mockResolvedValue(circle as never);
  vi.mocked(Membership.findOne).mockResolvedValue(membership as never);
  vi.mocked(Transaction.create).mockImplementation(
    (doc: unknown) => Promise.resolve({ ...(doc as object), _id: 't1', createdAt: new Date() }) as never
  );
});

describe('recordContribution', () => {
  it('records a partial contribution without completing the cycle', async () => {
    const cycle = makeCycle({ totalCollected: 0 });
    vi.mocked(Cycle.findOne).mockResolvedValue(cycle as never);
    vi.mocked(Membership.countDocuments).mockResolvedValue(3); // 3 members, ₹100 each = ₹300 target

    await recordContribution('c1', 'cy1', 'u1');

    expect(Transaction.create).toHaveBeenCalledOnce(); // contribution only, no payout yet
    expect(cycle.totalCollected).toBe(100);
    expect(cycle.status).toBe('collecting'); // still open
    expect(cycle.save).toHaveBeenCalledOnce();
    expect(Circle.updateOne).not.toHaveBeenCalled();
    expect(adjustTrustScore).toHaveBeenCalledWith('u1', false); // on time
  });

  it('fires the payout and rolls to the next cycle once fully collected', async () => {
    const currentCycle = makeCycle({ totalCollected: 200, cycleNumber: 1 }); // 2 of 3 already paid
    const nextCycle = { _id: 'cy2', cycleNumber: 2, status: 'pending', save: vi.fn() };

    vi.mocked(Cycle.findOne).mockImplementation((query: unknown) => {
      const q = query as { _id?: string; cycleNumber?: number };
      return Promise.resolve(q._id ? currentCycle : nextCycle) as never;
    });
    vi.mocked(Membership.countDocuments).mockResolvedValue(3);

    await recordContribution('c1', 'cy1', 'u1');

    expect(Transaction.create).toHaveBeenCalledTimes(2); // contribution + payout
    expect(Transaction.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'payout', userId: 'u1', amount: 300 })
    );
    expect(currentCycle.status).toBe('completed');
    expect(Membership.updateOne).toHaveBeenCalledWith(
      { circleId: 'c1', userId: 'u1' },
      { hasReceivedPayout: true }
    );
    expect(nextCycle.status).toBe('collecting'); // next cycle opens
    expect(nextCycle.save).toHaveBeenCalledOnce();
    expect(Circle.updateOne).not.toHaveBeenCalled(); // circle isn't done — cycle 2 remains
    expect(createNotification).toHaveBeenCalledOnce();
  });

  it('marks the circle completed when the last cycle finishes and there is no next cycle', async () => {
    const currentCycle = makeCycle({ totalCollected: 200, cycleNumber: 3 });

    vi.mocked(Cycle.findOne).mockImplementation((query: unknown) => {
      const q = query as { _id?: string };
      return Promise.resolve(q._id ? currentCycle : null) as never; // no cycle 4
    });
    vi.mocked(Membership.countDocuments).mockResolvedValue(3);

    await recordContribution('c1', 'cy1', 'u1');

    expect(Circle.updateOne).toHaveBeenCalledWith({ _id: 'c1' }, { status: 'completed' });
  });

  it('flags a late contribution instead of on-time', async () => {
    const cycle = makeCycle({ dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }); // due yesterday
    vi.mocked(Cycle.findOne).mockResolvedValue(cycle as never);
    vi.mocked(Membership.countDocuments).mockResolvedValue(3);

    await recordContribution('c1', 'cy1', 'u1');

    expect(adjustTrustScore).toHaveBeenCalledWith('u1', true);
  });

  it('rejects a contribution to a cycle that is not currently collecting', async () => {
    vi.mocked(Cycle.findOne).mockResolvedValue(makeCycle({ status: 'pending' }) as never);

    await expect(recordContribution('c1', 'cy1', 'u1')).rejects.toThrow(
      'This cycle is not currently collecting contributions'
    );
    expect(Transaction.create).not.toHaveBeenCalled();
  });

  it('rejects a contribution from someone who is not an active member', async () => {
    vi.mocked(Cycle.findOne).mockResolvedValue(makeCycle() as never);
    vi.mocked(Membership.findOne).mockResolvedValue(null);

    await expect(recordContribution('c1', 'cy1', 'u1')).rejects.toThrow(
      'That user is not an active member of this circle'
    );
  });

  it('converts a duplicate-contribution DB error into a clear conflict message', async () => {
    vi.mocked(Cycle.findOne).mockResolvedValue(makeCycle() as never);
    vi.mocked(Transaction.create).mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));

    await expect(recordContribution('c1', 'cy1', 'u1')).rejects.toThrow(
      'This member has already contributed to this cycle'
    );
  });
});
