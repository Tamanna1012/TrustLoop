import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/ApiResponse.js';

const router = Router();

const MONGOOSE_READY_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

router.get('/', (_req, res) => {
  // Always 200 — this is a liveness check (is the process up), not a
  // readiness gate. Returning non-200 on a transient DB blip would let the
  // host kill/restart a perfectly fine process; mongoose reconnects on its
  // own. `database` is informational so a real outage is still visible.
  sendSuccess(res, 200, {
    message: 'TrustLoop API is running',
    timestamp: new Date().toISOString(),
    database: MONGOOSE_READY_STATES[mongoose.connection.readyState] ?? 'unknown'
  });
});

export default router;
