import { Router } from 'express';
import { sendSuccess } from '../utils/ApiResponse.js';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, 200, { message: 'TrustLoop API is running', timestamp: new Date().toISOString() });
});

export default router;
