import { z } from 'zod';

export const createCircleSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().trim().max(500).optional(),
  contributionAmount: z.number().positive('Contribution amount must be greater than 0'),
  cycleFrequency: z.enum(['weekly', 'monthly']),
  maxMembers: z.number().int().min(2, 'A circle needs at least 2 members').max(50)
});

export const joinCircleSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Invite code is required')
});

export const contributionSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id')
});

export type CreateCircleInput = z.infer<typeof createCircleSchema>;
export type JoinCircleInput = z.infer<typeof joinCircleSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
