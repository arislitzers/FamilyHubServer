'use client';

import { useTransition } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { deleteCheckInAction } from './actions';
import type { CheckIn } from '@/types/reminders.types';

export function CheckInCard({
  checkIn,
  canDelete,
}: {
  checkIn: CheckIn;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const authorName = checkIn.authorName || 'A family member';

  const remove = () => {
    startTransition(() => {
      deleteCheckInAction(checkIn.id);
    });
  };

  return (
    <div className="flex items-start gap-3 rounded-md border border-linen-300 bg-white p-3.5 dark:border-dusk-600 dark:bg-dusk-800">
      <Avatar className="h-9 w-9">
        <AvatarImage src={checkIn.authorAvatarUrl ?? undefined} alt={authorName} />
        <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-dusk-700 dark:text-linen-100">
          <span className="font-medium">{authorName}</span> · {checkIn.status}
        </p>
        {checkIn.note && (
          <p className="mt-0.5 text-sm text-dusk-500 dark:text-dusk-200">{checkIn.note}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-dusk-300 dark:text-dusk-400">
          <span>
            {new Date(checkIn.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          {checkIn.locationLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {checkIn.locationLabel}
            </span>
          )}
        </div>
      </div>

      {canDelete && (
        <button
          onClick={remove}
          disabled={isPending}
          aria-label="Delete check-in"
          className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
