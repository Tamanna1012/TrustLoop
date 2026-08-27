import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-sunken text-foreground-muted',
        primary: 'bg-primary-soft text-primary-strong',
        accent: 'bg-accent-soft text-accent',
        success: 'bg-success-soft text-success',
        destructive: 'bg-destructive-soft text-destructive',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
