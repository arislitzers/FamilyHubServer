import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('skeleton-shimmer animate-shimmer rounded-md bg-linen-300 dark:bg-dusk-600', className)}
    />
  );
}
