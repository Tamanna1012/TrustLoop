import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
      <Icon className="size-8 text-foreground-faint" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-foreground-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
