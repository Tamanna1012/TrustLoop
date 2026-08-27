import type { Request, Response } from 'express';
import { Membership } from '../models/membership.model.js';
import { Cycle } from '../models/cycle.model.js';
import { Transaction } from '../models/transaction.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as circleService from '../services/circle.service.js';
import * as cycleService from '../services/cycle.service.js';
import * as contributionService from '../services/contribution.service.js';
import type { CreateCircleInput, JoinCircleInput, ContributionInput } from '../schemas/circle.schema.js';

export const createCircle = asyncHandler(async (req: Request, res: Response) => {
  const circle = await circleService.createCircle(req.user!.id, req.body as CreateCircleInput);
  sendSuccess(res, 201, { circle });
});

export const listMyCircles = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await Membership.find({ userId: req.user!.id, status: 'active' })
    .populate('circleId')
    .sort({ createdAt: -1 });

  const circles = memberships.map((membership) => ({
    circle: membership.circleId,
    payoutPosition: membership.payoutPosition,
    hasReceivedPayout: membership.hasReceivedPayout
  }));

  sendSuccess(res, 200, { circles });
});

export const getCircle = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, { circle: req.circle, membership: req.membership });
});

export const joinCircle = asyncHandler(async (req: Request, res: Response) => {
  const { inviteCode } = req.body as JoinCircleInput;
  const { circle, membership } = await circleService.joinCircle(req.user!.id, inviteCode);
  sendSuccess(res, 201, { circle, membership });
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await Membership.find({ circleId: req.circle!._id, status: 'active' })
    .populate('userId', 'name avatarUrl trustScore')
    .sort({ payoutPosition: 1 });

  sendSuccess(res, 200, { members });
});

export const activateCircle = asyncHandler(async (req: Request, res: Response) => {
  const circle = await cycleService.activateCircle(req.circle!.id);
  sendSuccess(res, 200, { circle });
});

export const listCycles = asyncHandler(async (req: Request, res: Response) => {
  const cycles = await Cycle.find({ circleId: req.circle!._id })
    .populate('payoutRecipient', 'name avatarUrl')
    .sort({ cycleNumber: 1 });

  sendSuccess(res, 200, { cycles });
});

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({ circleId: req.circle!._id })
    .populate('userId', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(200);

  sendSuccess(res, 200, { transactions });
});

export const recordContribution = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body as ContributionInput;
  const { transaction, cycle } = await contributionService.recordContribution(
    req.circle!.id,
    req.params.cycleId!,
    userId
  );
  sendSuccess(res, 201, { transaction, cycle });
});
