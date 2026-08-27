import type { AuthenticatedUser } from '../utils/jwt.js';
import type { CircleDoc } from '../models/circle.model.js';
import type { MembershipDoc } from '../models/membership.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      circle?: CircleDoc;
      membership?: MembershipDoc;
    }
  }
}

export {};
