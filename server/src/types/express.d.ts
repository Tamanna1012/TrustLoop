import type { AuthenticatedUser } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
