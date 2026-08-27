import type { Request, Response } from 'express';
import { Dispute } from '../models/dispute.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as disputeService from '../services/dispute.service.js';
import type { CreateDisputeInput, ResolveDisputeInput } from '../schemas/dispute.schema.js';

export const createDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputeService.createDispute(req.circle!.id, req.user!.id, req.body as CreateDisputeInput);
  sendSuccess(res, 201, { dispute });
});

export const listDisputes = asyncHandler(async (req: Request, res: Response) => {
  const disputes = await Dispute.find({ circleId: req.circle!._id })
    .populate('raisedBy', 'name avatarUrl')
    .populate('againstUser', 'name avatarUrl')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, { disputes });
});

export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputeService.resolveDispute(
    req.circle!.id,
    req.params.disputeId!,
    req.user!.id,
    req.user!.role === 'platformAdmin',
    req.body as ResolveDisputeInput
  );
  sendSuccess(res, 200, { dispute });
});
