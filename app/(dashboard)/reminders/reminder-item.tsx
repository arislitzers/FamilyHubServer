'use client';

import { useTransition } from 'react';
import { Trash2, Users } from 'lucide-react';
import { toggleReminderAction, deleteReminderAction } from './actions';
import { cn, formatDate } from '@/lib/utils';
import type { Reminder } from '@/types/reminders.types';

export function ReminderItem({ reminder }: { reminder: Reminder }) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(() => {
      toggleReminderAction(reminder.id, !reminder.isCompleted);
    });
  };

  const remove = () => {
    startTransition(() => {
      deleteReminderAction(reminder.id);
    });
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-linen-300 bg-white p-3.5 dark:border-dusk-600 dark:bg-dusk-800',
        reminder.isCompleted && 'opacity-60'
      )}
    >
      <button
        onClick={toggle}
        disabled={isPending}
        aria-label={reminder.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90',
          reminder.isCompleted
            ? 'border-sage-400 bg-sage-400 text-white'
            : 'border-linen-400 dark:border-dusk-500'
        )}
      >
        {reminder.isCompleted && (
          <svg viewBox="0 0 24 24" className="h-3 w-3 animate-check-pop" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-dusk-700 dark:text-linen-100',
            reminder.isCompleted && 'line-through'
          )}
        >
          {reminder.title}
        </p>
        {reminder.notes && (
          <p className="mt-0.5 text-xs text-dusk-400 dark:text-dusk-300">{reminder.notes}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-dusk-300 dark:text-dusk-400">
          <span>
            {formatDate(reminder.remindAt, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              year: undefined,
            })}
          </span>
          {reminder.familyId && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Shared
            </span>
          )}
        </div>
      </div>

      <button
        onClick={remove}
        disabled={isPending}
        aria-label="Delete reminder"
        className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
