import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-faint',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-[13px] font-medium text-foreground-muted', className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-[13px] text-destructive">{children}</p>;
}
