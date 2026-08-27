import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCircle, joinCircle } from './circle.service.js';
import { Circle } from '../models/circle.model.js';
import { Membership } from '../models/membership.model.js';

vi.mock('../models/circle.model.js', () => ({
  Circle: { create: vi.fn(), findOne: vi.fn() },
}));
vi.mock('../models/membership.model.js', () => ({
  Membership: { create: vi.fn(), countDocuments: vi.fn() },
}));

const dupKeyError = Object.assign(new Error('dup'), { code: 11000 });

beforeEach(() => vi.clearAllMocks());

describe('createCircle', () => {
  it('creates the circle and seeds the creator as its first member at position 0', async () => {
    const circle = { _id: 'c1' };
    vi.mocked(Circle.create).mockResolvedValue(circle as never);

    const result = await createCircle('u1', {
      name: 'Test',
      contributionAmount: 100,
      cycleFrequency: 'monthly',
      maxMembers: 5,
    });

    expect(result).toBe(circle);
    expect(Membership.create).toHaveBeenCalledWith({ circleId: 'c1', userId: 'u1', payoutPosition: 0 });
  });

  it('retries with a new invite code on a collision instead of failing the request', async () => {
    vi.mocked(Circle.create)
      .mockRejectedValueOnce(dupKeyError)
      .mockResolvedValueOnce({ _id: 'c1' } as never);

    const result = await createCircle('u1', {
      name: 'Test',
      contributionAmount: 100,
      cycleFrequency: 'monthly',
      maxMembers: 5,
    });

    expect(Circle.create).toHaveBeenCalledTimes(2);
    expect(result._id).toBe('c1');
  });
});

describe('joinCircle', () => {
  it('rejects an invite code that does not match any circle', async () => {
    vi.mocked(Circle.findOne).mockResolvedValue(null);

    await expect(joinCircle('u2', 'BAD-CODE')).rejects.toThrow('Invalid invite code');
  });

  it('rejects joining a circle that has already started', async () => {
    vi.mocked(Circle.findOne).mockResolvedValue({ status: 'active' } as never);

    await expect(joinCircle('u2', 'TL-1234')).rejects.toThrow('This circle is no longer accepting members');
  });

  it('rejects joining once the circle has reached its member cap', async () => {
    vi.mocked(Circle.findOne).mockResolvedValue({ status: 'forming', maxMembers: 3, _id: 'c1' } as never);
    vi.mocked(Membership.countDocuments).mockResolvedValue(3);

    await expect(joinCircle('u2', 'TL-1234')).rejects.toThrow('This circle is full');
  });

  it('assigns the next payout position based on current member count', async () => {
    const circle = { status: 'forming', maxMembers: 5, _id: 'c1' };
    vi.mocked(Circle.findOne).mockResolvedValue(circle as never);
    vi.mocked(Membership.countDocuments).mockResolvedValue(2);
    vi.mocked(Membership.create).mockResolvedValue({ _id: 'm3' } as never);

    await joinCircle('u3', 'TL-1234');

    expect(Membership.create).toHaveBeenCalledWith({ circleId: 'c1', userId: 'u3', payoutPosition: 2 });
  });

  it('rejects a member trying to join the same circle twice', async () => {
    vi.mocked(Circle.findOne).mockResolvedValue({ status: 'forming', maxMembers: 5, _id: 'c1' } as never);
    vi.mocked(Membership.countDocuments).mockResolvedValue(1);
    vi.mocked(Membership.create).mockRejectedValue(dupKeyError);

    await expect(joinCircle('u1', 'TL-1234')).rejects.toThrow('You have already joined this circle');
  });
});
