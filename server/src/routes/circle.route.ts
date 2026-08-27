import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loadCircle, requireCircleAdmin, requireCircleMember } from '../middleware/circleAccess.js';
import { validateBody } from '../middleware/validate.js';
import { createCircleSchema, joinCircleSchema, contributionSchema } from '../schemas/circle.schema.js';
import { createDisputeSchema, resolveDisputeSchema } from '../schemas/dispute.schema.js';
import { verifyPaymentSchema } from '../schemas/payment.schema.js';
import * as circleController from '../controllers/circle.controller.js';
import * as disputeController from '../controllers/dispute.controller.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Tighter than the blanket /api limit — order creation and signature
// verification touch real money (even in test mode) and are worth
// rate-limiting on their own regardless of what else is happening on the API.
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(requireAuth);

router.post('/', validateBody(createCircleSchema), circleController.createCircle);
router.get('/', circleController.listMyCircles);
// Not nested under /:id — a joining user only has an invite code, not the
// circle's database id, so the invite code alone has to resolve the circle.
router.post('/join', validateBody(joinCircleSchema), circleController.joinCircle);

router.get('/:id', loadCircle, requireCircleMember, circleController.getCircle);
router.get('/:id/members', loadCircle, requireCircleMember, circleController.listMembers);
router.get('/:id/cycles', loadCircle, requireCircleMember, circleController.listCycles);
router.get('/:id/transactions', loadCircle, requireCircleMember, circleController.listTransactions);

router.post('/:id/activate', loadCircle, requireCircleAdmin, circleController.activateCircle);
router.post(
  '/:id/cycles/:cycleId/contributions',
  loadCircle,
  requireCircleAdmin,
  validateBody(contributionSchema),
  circleController.recordContribution
);

router.post(
  '/:id/cycles/:cycleId/payment-order',
  paymentLimiter,
  loadCircle,
  requireCircleMember,
  paymentController.createPaymentOrder
);
router.post(
  '/:id/cycles/:cycleId/payment-verify',
  paymentLimiter,
  loadCircle,
  requireCircleMember,
  validateBody(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.post(
  '/:id/disputes',
  loadCircle,
  requireCircleMember,
  validateBody(createDisputeSchema),
  disputeController.createDispute
);
router.get('/:id/disputes', loadCircle, requireCircleMember, disputeController.listDisputes);
router.patch(
  '/:id/disputes/:disputeId',
  loadCircle,
  validateBody(resolveDisputeSchema),
  disputeController.resolveDispute
);

export default router;
