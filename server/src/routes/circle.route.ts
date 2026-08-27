import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loadCircle, requireCircleAdmin, requireCircleMember } from '../middleware/circleAccess.js';
import { validateBody } from '../middleware/validate.js';
import { createCircleSchema, joinCircleSchema, contributionSchema } from '../schemas/circle.schema.js';
import * as circleController from '../controllers/circle.controller.js';

const router = Router();

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

export default router;
