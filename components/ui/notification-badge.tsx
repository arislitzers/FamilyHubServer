import { cn } from '@/lib/utils';

/** Small numeric/dot badge for unread counts, meant to sit on an icon corner. */
export function NotificationBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      key={count}
      className={cn(
        'absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-hearth-500 px-1 text-[10px] font-semibold leading-none text-white animate-badge-in',
        className
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
