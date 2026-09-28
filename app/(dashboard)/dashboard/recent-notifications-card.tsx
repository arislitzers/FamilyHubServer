'use client';

import Link from 'next/link';
import { Bell, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationTypeIcon } from '@/components/shared/notification-icon';
import { useNotifications } from '@/contexts/notification-context';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function RecentNotificationsCard() {
  const { notifications, markAsRead, loading } = useNotifications();
  const recent = notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" /> Recent notifications
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
          <Link href={ROUTES.notifications}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <p className="py-4 text-center text-sm text-dusk-300 dark:text-dusk-500">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-dusk-300 dark:text-dusk-500">
            Nothing yet — you&apos;re all caught up.
          </p>
        ) : (
          recent.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={cn(
                'flex items-start gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-linen-300 dark:hover:bg-dusk-700',
                !n.isRead && 'bg-hearth-50/60 dark:bg-hearth-900/10'
              )}
            >
              <NotificationTypeIcon type={n.type} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hearth-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-dusk-700 dark:text-linen-100">{n.title}</p>
                <p className="text-xs text-dusk-300 dark:text-dusk-500">{relativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hearth-500" />}
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
