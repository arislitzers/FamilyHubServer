'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

// A focused subset of NAV_ITEMS — mobile real estate is limited, so the
// bottom bar surfaces the 5 highest-traffic destinations only.
const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Family', href: ROUTES.family, icon: Users },
  { label: 'Planner', href: ROUTES.planner, icon: CalendarDays },
  { label: 'Chat', href: ROUTES.chat, icon: MessageCircle },
  { label: 'Settings', href: ROUTES.settings, icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-linen-300 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-dusk-600 dark:bg-dusk-800/95 md:hidden">
      {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium',
              isActive ? 'text-hearth-500' : 'text-dusk-400 dark:text-dusk-300'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
