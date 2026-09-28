import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-dusk-400 transition-colors hover:text-hearth-500 dark:text-dusk-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(isLast && 'font-medium text-dusk-700 dark:text-linen-100', !isLast && 'text-dusk-400')}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-dusk-300 dark:text-dusk-500" aria-hidden />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
