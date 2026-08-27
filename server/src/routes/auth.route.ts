import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Tighter limit than the blanket /api limiter — credential endpoints are the
// most attractive brute-force target on the whole API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
