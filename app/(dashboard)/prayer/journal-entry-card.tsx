'use client';

import { useTransition } from 'react';
import { Trash2, Users, Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { deleteJournalEntryAction } from './actions';
import type { PrayerJournalEntry } from '@/types/prayer.types';

export function JournalEntryCard({
  entry,
  ownerName,
  canDelete,
}: {
  entry: PrayerJournalEntry;
  ownerName?: string;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    startTransition(() => {
      deleteJournalEntryAction(entry.id);
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-linen-300 bg-white p-4 dark:border-dusk-600 dark:bg-dusk-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          {entry.title && (
            <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{entry.title}</p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-dusk-300 dark:text-dusk-500">
            {ownerName && <span>{ownerName} ·</span>}
            {formatDate(entry.entryDate, { month: 'long', day: 'numeric', year: 'numeric' })}
            {entry.isShared ? (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Shared
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Private
              </span>
            )}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={remove}
            disabled={isPending}
            aria-label="Delete entry"
            className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm text-dusk-600 dark:text-dusk-200">{entry.content}</p>
    </div>
  );
}
