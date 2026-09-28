import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-linen-400 bg-linen-100/60 p-12 text-center dark:border-dusk-500 dark:bg-dusk-800/40',
        className
      )}
    >
      {icon && <div className="text-hearth-400">{icon}</div>}
      <h3 className="font-display text-lg text-dusk-700 dark:text-linen-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-dusk-400 dark:text-dusk-200">{description}</p>}
      {action}
    </div>
  );
}
