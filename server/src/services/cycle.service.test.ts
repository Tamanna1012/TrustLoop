import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activateCircle } from './cycle.service.js';
import { Circle } from '../models/circle.model.js';
import { Membership } from '../models/membership.model.js';
import { Cycle } from '../models/cycle.model.js';

vi.mock('../models/circle.model.js', () => ({
  Circle: { findById: vi.fn() },
}));
vi.mock('../models/membership.model.js', () => ({
  Membership: { find: vi.fn() },
}));
vi.mock('../models/cycle.model.js', () => ({
  Cycle: { insertMany: vi.fn() },
}));

function mockMembers(members: { userId: string }[]) {
  vi.mocked(Membership.find).mockReturnValue({ sort: vi.fn().mockResolvedValue(members) } as never);
}

beforeEach(() => vi.clearAllMocks());

describe('activateCircle', () => {
  it('refuses to start with fewer than 2 members', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ status: 'forming' } as never);
    mockMembers([{ userId: 'u1' }]);

    await expect(activateCircle('c1')).rejects.toThrow(
      'A circle needs at least 2 members before it can start'
    );
    expect(Cycle.insertMany).not.toHaveBeenCalled();
  });

  it('refuses to re-activate a circle that already started', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ status: 'active' } as never);

    await expect(activateCircle('c1')).rejects.toThrow('This circle has already started');
  });

  it('creates one cycle per member, in payout order, first one collecting', async () => {
    const circle = { status: 'forming', cycleFrequency: 'monthly', save: vi.fn() };
    vi.mocked(Circle.findById).mockResolvedValue(circle as never);
    mockMembers([{ userId: 'u1' }, { userId: 'u2' }, { userId: 'u3' }]);

    await activateCircle('c1');

    const cycles = vi.mocked(Cycle.insertMany).mock.calls[0]![0] as Array<Record<string, unknown>>;
    expect(cycles).toHaveLength(3);
    expect(cycles.map((c) => c.cycleNumber)).toEqual([1, 2, 3]);
    expect(cycles.map((c) => c.payoutRecipient)).toEqual(['u1', 'u2', 'u3']);
    expect(cycles[0]!.status).toBe('collecting');
    expect(cycles[1]!.status).toBe('pending');
    expect(cycles[2]!.status).toBe('pending');
    expect(circle.status).toBe('active');
    expect(circle.save).toHaveBeenCalledOnce();
  });

  it('spaces due dates 7 days apart for a weekly circle and 30 for monthly', async () => {
    const weeklyCircle = { status: 'forming', cycleFrequency: 'weekly', save: vi.fn() };
    vi.mocked(Circle.findById).mockResolvedValue(weeklyCircle as never);
    mockMembers([{ userId: 'u1' }, { userId: 'u2' }]);

    const before = Date.now();
    await activateCircle('c1');
    const cycles = vi.mocked(Cycle.insertMany).mock.calls[0]![0] as Array<{ dueDate: Date }>;

    const dayMs = 24 * 60 * 60 * 1000;
    const gap = cycles[1]!.dueDate.getTime() - cycles[0]!.dueDate.getTime();
    expect(gap).toBe(7 * dayMs);
    expect(cycles[0]!.dueDate.getTime()).toBeGreaterThanOrEqual(before + 7 * dayMs - 1000);
  });
});
