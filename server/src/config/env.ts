import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

    // Optional: payments work in admin-confirmed mode without these. Set both
    // to enable real (test-mode) Razorpay checkout for self-service contributions.
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional()
  })
  // The CLIENT_ORIGIN default exists purely for local-dev convenience. If it's
  // still unset in production, CORS would silently reject the real frontend's
  // requests with no clear error pointing at why — fail loudly at boot instead.
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLIENT_ORIGIN'],
        message: 'CLIENT_ORIGIN must be set explicitly in production (no default is used)'
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed — check your .env file against .env.example');
}

export const env = parsed.data;
