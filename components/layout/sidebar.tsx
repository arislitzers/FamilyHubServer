'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  CalendarDays,
  BellRing,
  Sparkles,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, ROUTES } from '@/constants/routes';
import { SITE } from '@/constants/site';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  UserCircle,
  CalendarDays,
  BellRing,
  Sparkles,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-linen-300 bg-linen-100 dark:border-dusk-600 dark:bg-dusk-800 md:flex">
      <Link href={ROUTES.dashboard} className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-white">
          <Home className="h-4 w-4" />
        </span>
        <span className="font-display text-lg text-dusk-700 dark:text-linen-100">{SITE.name}</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-hearth-100 text-hearth-700 dark:bg-hearth-900/40 dark:text-hearth-200'
                  : 'text-dusk-500 hover:bg-linen-300 dark:text-dusk-200 dark:hover:bg-dusk-700'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-linen-300 p-4 text-xs text-dusk-300 dark:border-dusk-600 dark:text-dusk-400">
        {SITE.tagline}
      </div>
    </aside>
  );
}
