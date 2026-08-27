import { Types } from 'mongoose';
import { Circle } from '../models/circle.model.js';
import { Dispute, type DisputeDoc } from '../models/dispute.model.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';
import type { CreateDisputeInput, ResolveDisputeInput } from '../schemas/dispute.schema.js';

export async function createDispute(
  circleId: string,
  raisedBy: string,
  input: CreateDisputeInput
): Promise<DisputeDoc> {
  const circle = await Circle.findById(circleId);
  if (!circle) {
    throw ApiError.notFound('Circle not found');
  }

  const dispute = await Dispute.create({
    circleId,
    raisedBy,
    againstUser: input.againstUser,
    description: input.description,
  });

  if (!circle.createdBy.equals(raisedBy)) {
    await createNotification(
      circle.createdBy.toString(),
      'dispute_raised',
      `A dispute was raised in "${circle.name}" that needs your attention.`
    );
  }

  return dispute;
}

export async function resolveDispute(
  circleId: string,
  disputeId: string,
  resolverId: string,
  isPlatformAdmin: boolean,
  input: ResolveDisputeInput
): Promise<DisputeDoc> {
  const circle = await Circle.findById(circleId);
  if (!circle) {
    throw ApiError.notFound('Circle not found');
  }

  const isCircleAdmin = circle.createdBy.equals(resolverId);
  if (!isCircleAdmin && !isPlatformAdmin) {
    throw ApiError.forbidden('Only the circle admin or a platform admin can resolve disputes');
  }

  const dispute = await Dispute.findOne({ _id: disputeId, circleId });
  if (!dispute) {
    throw ApiError.notFound('Dispute not found');
  }

  dispute.status = input.status;
  dispute.resolutionNote = input.resolutionNote;
  dispute.resolvedBy = new Types.ObjectId(resolverId);
  await dispute.save();

  if (input.status === 'resolved' || input.status === 'rejected') {
    await createNotification(
      dispute.raisedBy.toString(),
      'dispute_resolved',
      `Your dispute in "${circle.name}" was marked ${input.status}.`
    );
  }

  return dispute;
}
