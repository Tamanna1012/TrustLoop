import crypto from 'node:crypto';
import { Circle } from '../models/circle.model.js';
import { Cycle } from '../models/cycle.model.js';
import { Membership } from '../models/membership.model.js';
import { getRazorpayClient } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import * as contributionService from './contribution.service.js';
import type { TransactionDoc } from '../models/transaction.model.js';
import type { CycleDoc } from '../models/cycle.model.js';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createPaymentOrder(
  circleId: string,
  cycleId: string,
  userId: string
): Promise<PaymentOrder> {
  const circle = await Circle.findById(circleId);
  if (!circle) throw ApiError.notFound('Circle not found');

  const cycle = await Cycle.findOne({ _id: cycleId, circleId });
  if (!cycle) throw ApiError.notFound('Cycle not found');
  if (cycle.status !== 'collecting') {
    throw ApiError.badRequest('This cycle is not currently collecting contributions');
  }

  const membership = await Membership.findOne({ circleId, userId, status: 'active' });
  if (!membership) throw ApiError.forbidden('You are not an active member of this circle');

  const razorpay = getRazorpayClient();
  const amountInPaise = circle.contributionAmount * 100;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    notes: { circleId, cycleId, userId }
  });

  return { orderId: order.id, amount: amountInPaise, currency: order.currency, keyId: env.RAZORPAY_KEY_ID! };
}

export async function verifyAndRecordPayment(
  circleId: string,
  cycleId: string,
  userId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ transaction: TransactionDoc; cycle: CycleDoc }> {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw ApiError.badRequest('Payment verification failed — signature mismatch');
  }

  return contributionService.recordContribution(circleId, cycleId, userId, razorpayPaymentId);
}
