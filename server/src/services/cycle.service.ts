import { Circle, type CircleDoc } from '../models/circle.model.js';
import { Membership } from '../models/membership.model.js';
import { Cycle } from '../models/cycle.model.js';
import { ApiError } from '../utils/ApiError.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function activateCircle(circleId: string): Promise<CircleDoc> {
  const circle = await Circle.findById(circleId);
  if (!circle) {
    throw ApiError.notFound('Circle not found');
  }
  if (circle.status !== 'forming') {
    throw ApiError.badRequest('This circle has already started');
  }

  const members = await Membership.find({ circleId, status: 'active' }).sort({ payoutPosition: 1 });
  if (members.length < 2) {
    throw ApiError.badRequest('A circle needs at least 2 members before it can start');
  }

  const frequencyDays = circle.cycleFrequency === 'weekly' ? 7 : 30;
  const now = new Date();

  await Cycle.insertMany(
    members.map((member, index) => ({
      circleId: circle._id,
      cycleNumber: index + 1,
      dueDate: new Date(now.getTime() + frequencyDays * (index + 1) * MS_PER_DAY),
      payoutRecipient: member.userId,
      status: index === 0 ? 'collecting' : 'pending'
    }))
  );

  circle.status = 'active';
  circle.startDate = now;
  await circle.save();

  return circle;
}
