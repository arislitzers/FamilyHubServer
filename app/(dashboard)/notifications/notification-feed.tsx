'use client';

import { useMemo, useState } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { NotificationTypeIcon } from '@/components/shared/notification-icon';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/notification-context';
import { NOTIFICATION_CATEGORIES, getNotificationCategory } from '@/types/notifications.types';
import type { AppNotification, NotificationCategoryKey } from '@/types/notifications.types';

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const { markAsRead, dismiss } = useNotifications();

  return (
    <div
      onClick={() => !notification.isRead && markAsRead(notification.id)}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border border-linen-300 bg-white p-4 transition-colors dark:border-dusk-600 dark:bg-dusk-800',
        !notification.isRead && 'border-hearth-200 bg-hearth-50/50 dark:border-hearth-500/30 dark:bg-hearth-900/10'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          notification.isRead
            ? 'bg-linen-300 text-dusk-400 dark:bg-dusk-700 dark:text-dusk-300'
            : 'bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200'
        )}
      >
        <NotificationTypeIcon type={notification.type} className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 truncate text-sm text-dusk-400 dark:text-dusk-300">{notification.body}</p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-dusk-300 dark:text-dusk-500">
          {relativeTime(notification.createdAt)}
          <span aria-hidden>·</span>
          {getNotificationCategory(notification.type).label}
        </p>
      </div>

      {!notification.isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hearth-500" aria-hidden />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss(notification.id);
        }}
        aria-label="Dismiss notification"
        className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function NotificationList({ notifications }: { notifications: AppNotification[] }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-8 w-8" />}
        title="Nothing here"
        description="You're all caught up."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <NotificationRow key={n.id} notification={n} />
      ))}
    </div>
  );
}

export function NotificationFeed() {
  const { notifications, unreadCount, loading, markAllAsRead, deleteAllRead } = useNotifications();
  const [category, setCategory] = useState<NotificationCategoryKey | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const readCount = notifications.length - unreadCount;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (unreadOnly && n.isRead) return false;
      if (category !== 'all' && getNotificationCategory(n.type).key !== category) return false;
      return true;
    });
  }, [notifications, category, unreadOnly]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategory('all')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              category === 'all'
                ? 'bg-hearth-400 text-white'
                : 'border border-linen-300 text-dusk-500 hover:border-hearth-300 dark:border-dusk-600 dark:text-dusk-200'
            )}
          >
            All ({notifications.length})
          </button>
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const count = notifications.filter((n) => getNotificationCategory(n.type).key === cat.key).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  category === cat.key
                    ? 'bg-hearth-400 text-white'
                    : 'border border-linen-300 text-dusk-500 hover:border-hearth-300 dark:border-dusk-600 dark:text-dusk-200'
                )}
              >
                {cat.label} ({count})
              </button>
            );
          })}
          <button
            onClick={() => setUnreadOnly((v) => !v)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              unreadOnly
                ? 'bg-dusk-600 text-white dark:bg-dusk-500'
                : 'border border-linen-300 text-dusk-500 hover:border-hearth-300 dark:border-dusk-600 dark:text-dusk-200'
            )}
          >
            Unread only
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {readCount > 0 && (
            <Button variant="outline" size="sm" onClick={deleteAllRead} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Delete read
            </Button>
          )}
        </div>
      </div>

      <NotificationList notifications={filtered} />
    </div>
  );
}
