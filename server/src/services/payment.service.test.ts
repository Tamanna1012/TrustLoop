import crypto from 'node:crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAndRecordPayment } from './payment.service.js';
import * as contributionService from './contribution.service.js';

vi.mock('../config/env.js', () => ({
  env: { RAZORPAY_KEY_SECRET: 'test-secret', RAZORPAY_KEY_ID: 'test-key-id' },
}));
vi.mock('./contribution.service.js', () => ({ recordContribution: vi.fn() }));

function signaturesFor(orderId: string, paymentId: string) {
  return crypto.createHmac('sha256', 'test-secret').update(`${orderId}|${paymentId}`).digest('hex');
}

beforeEach(() => vi.clearAllMocks());

describe('verifyAndRecordPayment', () => {
  it('records the contribution when the signature is genuinely valid', async () => {
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const validSignature = signaturesFor(orderId, paymentId);
    vi.mocked(contributionService.recordContribution).mockResolvedValue({} as never);

    await verifyAndRecordPayment('c1', 'cy1', 'u1', orderId, paymentId, validSignature);

    expect(contributionService.recordContribution).toHaveBeenCalledWith('c1', 'cy1', 'u1', paymentId);
  });

  it('rejects a forged signature of the correct length', async () => {
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const valid = signaturesFor(orderId, paymentId);
    // Flip one hex character — same length, wrong value.
    const forged = (valid[0] === '0' ? '1' : '0') + valid.slice(1);

    await expect(verifyAndRecordPayment('c1', 'cy1', 'u1', orderId, paymentId, forged)).rejects.toThrow(
      'Payment verification failed'
    );
    expect(contributionService.recordContribution).not.toHaveBeenCalled();
  });

  it('rejects a signature of the wrong length without throwing on the length mismatch itself', async () => {
    await expect(
      verifyAndRecordPayment('c1', 'cy1', 'u1', 'order_1', 'pay_1', 'ab')
    ).rejects.toThrow('Payment verification failed');
  });

  it('rejects a signature for a tampered order/payment id pair', async () => {
    const signature = signaturesFor('order_1', 'pay_1');

    // Same signature, but claiming a different order id — must not verify.
    await expect(
      verifyAndRecordPayment('c1', 'cy1', 'u1', 'order_2', 'pay_1', signature)
    ).rejects.toThrow('Payment verification failed');
  });
});
