'use client';

import { useTransition } from 'react';
import { Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WEEKDAY_LABELS } from '@/types/reminders.types';
import { togglePrayerReminderActiveAction, deletePrayerReminderAction } from './actions';
import type { PrayerReminder } from '@/types/reminders.types';

export function PrayerReminderItem({
  reminder,
  isShared,
}: {
  reminder: PrayerReminder;
  isShared?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const toggleActive = () => {
    startTransition(() => {
      togglePrayerReminderActiveAction(reminder.id, !reminder.isActive);
    });
  };

  const remove = () => {
    startTransition(() => {
      deletePrayerReminderAction(reminder.id);
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border border-linen-300 bg-white p-3.5 dark:border-dusk-600 dark:bg-dusk-800',
        !reminder.isActive && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-dusk-700 dark:text-linen-100">
          {reminder.label}
          {isShared && <Users className="h-3 w-3 text-dusk-300" aria-label="Shared with family" />}
        </p>
        <p className="mt-0.5 text-xs text-dusk-400 dark:text-dusk-300">
          {reminder.timeOfDay.slice(0, 5)} ·{' '}
          {reminder.daysOfWeek.length === 7
            ? 'Every day'
            : reminder.daysOfWeek.map((d) => WEEKDAY_LABELS[d]).join(', ')}
        </p>
      </div>

      {!isShared && (
        <button
          onClick={toggleActive}
          disabled={isPending}
          aria-label={reminder.isActive ? 'Pause' : 'Resume'}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            reminder.isActive ? 'bg-hearth-400' : 'bg-linen-400 dark:bg-dusk-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
              reminder.isActive ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      )}

      {!isShared && (
        <button
          onClick={remove}
          disabled={isPending}
          aria-label="Delete prayer reminder"
          className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
