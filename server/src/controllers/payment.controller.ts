import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as paymentService from '../services/payment.service.js';
import type { VerifyPaymentInput } from '../schemas/payment.schema.js';

export const createPaymentOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await paymentService.createPaymentOrder(req.circle!.id, req.params.cycleId!, req.user!.id);
  sendSuccess(res, 201, { order });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as VerifyPaymentInput;
  const { transaction, cycle } = await paymentService.verifyAndRecordPayment(
    req.circle!.id,
    req.params.cycleId!,
    req.user!.id,
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature
  );
  sendSuccess(res, 201, { transaction, cycle });
});
