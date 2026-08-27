import { api } from './api';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createPaymentOrderRequest(circleId: string, cycleId: string) {
  const res = await api.post<{ data: { order: PaymentOrder } }>(
    `/circles/${circleId}/cycles/${cycleId}/payment-order`
  );
  return res.data.data.order;
}

export async function verifyPaymentRequest(circleId: string, cycleId: string, payload: VerifyPaymentPayload) {
  await api.post(`/circles/${circleId}/cycles/${cycleId}/payment-verify`, payload);
}
