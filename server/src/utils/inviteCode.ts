import crypto from 'node:crypto';

export function generateInviteCode(): string {
  return `TL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}
