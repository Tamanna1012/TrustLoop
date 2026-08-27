import Razorpay from 'razorpay';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

let client: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

/** Lazily constructed so the app boots fine when payments aren't configured. */
export function getRazorpayClient(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw ApiError.badRequest(
      'Online payment is not configured for this deployment. Ask the circle admin to mark your contribution as paid instead.'
    );
  }
  client ??= new Razorpay({ key_id: env.RAZORPAY_KEY_ID!, key_secret: env.RAZORPAY_KEY_SECRET! });
  return client;
}
