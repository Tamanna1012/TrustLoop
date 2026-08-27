import { z } from 'zod';

export const createCircleSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  description: z.string().trim().max(500).optional(),
  contributionAmount: z.coerce.number().positive('Enter an amount greater than 0'),
  cycleFrequency: z.enum(['weekly', 'monthly']),
  maxMembers: z.coerce.number().int().min(2, 'A circle needs at least 2 members').max(50),
});

export const joinCircleSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Enter the invite code'),
});

export type CreateCircleFormValues = z.infer<typeof createCircleSchema>;
export type JoinCircleFormValues = z.infer<typeof joinCircleSchema>;
