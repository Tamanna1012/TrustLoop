import { Circle } from '../models/circle.model.js';
import { Cycle, type CycleDoc } from '../models/cycle.model.js';
import { Membership } from '../models/membership.model.js';
import { Transaction, type TransactionDoc } from '../models/transaction.model.js';
import { ApiError } from '../utils/ApiError.js';
import { isDuplicateKeyError } from '../utils/mongoErrors.js';
import { adjustTrustScore } from './trust.service.js';

export async function recordContribution(
  circleId: string,
  cycleId: string,
  targetUserId: string
): Promise<{ transaction: TransactionDoc; cycle: CycleDoc }> {
  const circle = await Circle.findById(circleId);
  if (!circle) {
    throw ApiError.notFound('Circle not found');
  }

  const cycle = await Cycle.findOne({ _id: cycleId, circleId });
  if (!cycle) {
    throw ApiError.notFound('Cycle not found');
  }
  if (cycle.status !== 'collecting') {
    throw ApiError.badRequest('This cycle is not currently collecting contributions');
  }

  const membership = await Membership.findOne({ circleId, userId: targetUserId, status: 'active' });
  if (!membership) {
    throw ApiError.badRequest('That user is not an active member of this circle');
  }

  let transaction: TransactionDoc;
  try {
    transaction = await Transaction.create({
      circleId,
      cycleId,
      userId: targetUserId,
      type: 'contribution',
      amount: circle.contributionAmount,
      status: 'completed'
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw ApiError.conflict('This member has already contributed to this cycle');
    }
    throw err;
  }

  const wasLate = transaction.createdAt.getTime() > cycle.dueDate.getTime();
  await adjustTrustScore(targetUserId, wasLate);

  cycle.totalCollected += circle.contributionAmount;

  const activeMemberCount = await Membership.countDocuments({ circleId, status: 'active' });
  const isFullyCollected = cycle.totalCollected >= circle.contributionAmount * activeMemberCount;

  if (isFullyCollected) {
    cycle.status = 'completed';

    await Transaction.create({
      circleId,
      cycleId,
      userId: cycle.payoutRecipient,
      type: 'payout',
      amount: cycle.totalCollected,
      status: 'completed'
    });
    await Membership.updateOne(
      { circleId, userId: cycle.payoutRecipient },
      { hasReceivedPayout: true }
    );

    const nextCycle = await Cycle.findOne({ circleId, cycleNumber: cycle.cycleNumber + 1 });
    if (nextCycle) {
      nextCycle.status = 'collecting';
      await nextCycle.save();
    } else {
      await Circle.updateOne({ _id: circleId }, { status: 'completed' });
    }
  }

  await cycle.save();

  return { transaction, cycle };
}
