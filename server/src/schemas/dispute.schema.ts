import { z } from 'zod';

export const createDisputeSchema = z.object({
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  againstUser: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id')
    .optional(),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['underReview', 'resolved', 'rejected']),
  resolutionNote: z.string().trim().max(1000).optional(),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
