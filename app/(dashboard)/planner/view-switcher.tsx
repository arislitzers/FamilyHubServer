'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const VIEWS = [
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
] as const;

export function ViewSwitcher({ activeView }: { activeView: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchTo = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-md bg-linen-300 p-1 dark:bg-dusk-700">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          onClick={() => switchTo(v.value)}
          className={cn(
            'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            activeView === v.value
              ? 'bg-white text-dusk-700 shadow-soft dark:bg-dusk-600 dark:text-linen-100'
              : 'text-dusk-500 dark:text-dusk-200'
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
