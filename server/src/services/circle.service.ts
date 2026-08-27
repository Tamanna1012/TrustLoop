import { Circle, type CircleDoc } from '../models/circle.model.js';
import { Membership, type MembershipDoc } from '../models/membership.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { isDuplicateKeyError } from '../utils/mongoErrors.js';
import type { CreateCircleInput } from '../schemas/circle.schema.js';

const MAX_INVITE_CODE_ATTEMPTS = 5;

export async function createCircle(userId: string, input: CreateCircleInput): Promise<CircleDoc> {
  let circle: CircleDoc | undefined;

  for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
    try {
      circle = await Circle.create({ ...input, createdBy: userId, inviteCode: generateInviteCode() });
      break;
    } catch (err) {
      if (isDuplicateKeyError(err) && attempt < MAX_INVITE_CODE_ATTEMPTS - 1) continue;
      throw err;
    }
  }

  await Membership.create({ circleId: circle!._id, userId, payoutPosition: 0 });
  return circle!;
}

export async function joinCircle(
  userId: string,
  inviteCode: string
): Promise<{ circle: CircleDoc; membership: MembershipDoc }> {
  const circle = await Circle.findOne({ inviteCode });
  if (!circle) {
    throw ApiError.notFound('Invalid invite code');
  }
  if (circle.status !== 'forming') {
    throw ApiError.badRequest('This circle is no longer accepting members');
  }

  const activeMemberCount = await Membership.countDocuments({ circleId: circle._id, status: 'active' });
  if (activeMemberCount >= circle.maxMembers) {
    throw ApiError.conflict('This circle is full');
  }

  try {
    const membership = await Membership.create({
      circleId: circle._id,
      userId,
      payoutPosition: activeMemberCount
    });
    return { circle, membership };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw ApiError.conflict('You have already joined this circle');
    }
    throw err;
  }
}
