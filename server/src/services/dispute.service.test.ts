import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDispute, resolveDispute } from './dispute.service.js';
import { Circle } from '../models/circle.model.js';
import { Dispute } from '../models/dispute.model.js';
import { createNotification } from './notification.service.js';

vi.mock('../models/circle.model.js', () => ({
  Circle: { findById: vi.fn() },
}));
vi.mock('../models/dispute.model.js', () => ({
  Dispute: { create: vi.fn(), findOne: vi.fn() },
}));
vi.mock('./notification.service.js', () => ({ createNotification: vi.fn() }));

// dispute.service calls `new Types.ObjectId(resolverId)`, so ids must be
// valid 24-char hex strings — real Mongoose ObjectId validation, not mocked.
const ADMIN_ID = '507f1f77bcf86cd799439011';
const MEMBER_ID = '507f1f77bcf86cd799439012';
const PLATFORM_ADMIN_ID = '507f1f77bcf86cd799439013';
const RANDOM_USER_ID = '507f1f77bcf86cd799439014';

// Mimics a Mongoose ObjectId closely enough for .equals()/.toString() comparisons.
function fakeId(id: string) {
  return { equals: (other: string) => other === id, toString: () => id };
}

beforeEach(() => vi.clearAllMocks());

describe('createDispute', () => {
  it('notifies the circle admin when someone else raises a dispute', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ createdBy: fakeId(ADMIN_ID), name: 'Circle A' } as never);
    vi.mocked(Dispute.create).mockResolvedValue({ _id: 'd1' } as never);

    await createDispute('c1', MEMBER_ID, { description: 'Payment was not recorded on time.' });

    expect(createNotification).toHaveBeenCalledWith(ADMIN_ID, 'dispute_raised', expect.stringContaining('Circle A'));
  });

  it('does not notify the admin about their own dispute', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ createdBy: fakeId(ADMIN_ID), name: 'Circle A' } as never);
    vi.mocked(Dispute.create).mockResolvedValue({ _id: 'd1' } as never);

    await createDispute('c1', ADMIN_ID, { description: 'Noting an issue for the record.' });

    expect(createNotification).not.toHaveBeenCalled();
  });
});

describe('resolveDispute', () => {
  it('lets the circle admin resolve a dispute in their own circle', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ createdBy: fakeId(ADMIN_ID), name: 'Circle A' } as never);
    const dispute = { raisedBy: fakeId(MEMBER_ID), save: vi.fn() };
    vi.mocked(Dispute.findOne).mockResolvedValue(dispute as never);

    await resolveDispute('c1', 'd1', ADMIN_ID, false, { status: 'resolved' });

    expect(dispute.save).toHaveBeenCalledOnce();
    expect(createNotification).toHaveBeenCalledWith(MEMBER_ID, 'dispute_resolved', expect.any(String));
  });

  it('lets a platform admin resolve a dispute in a circle they do not own', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ createdBy: fakeId(ADMIN_ID), name: 'Circle A' } as never);
    const dispute = { raisedBy: fakeId(MEMBER_ID), save: vi.fn() };
    vi.mocked(Dispute.findOne).mockResolvedValue(dispute as never);

    await expect(
      resolveDispute('c1', 'd1', PLATFORM_ADMIN_ID, true, { status: 'rejected' })
    ).resolves.toBeDefined();
  });

  it('rejects a regular member trying to resolve someone else\'s circle dispute', async () => {
    vi.mocked(Circle.findById).mockResolvedValue({ createdBy: fakeId(ADMIN_ID), name: 'Circle A' } as never);

    await expect(
      resolveDispute('c1', 'd1', RANDOM_USER_ID, false, { status: 'resolved' })
    ).rejects.toThrow('Only the circle admin or a platform admin can resolve disputes');
    expect(Dispute.findOne).not.toHaveBeenCalled();
  });
});
