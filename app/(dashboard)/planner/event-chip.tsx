'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Repeat, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { formatTime, toDateParam } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { updateEventAction, deleteEventAction } from './actions';
import { RecurrenceSelect } from './recurrence-select';
import { CategoryAndColorFields } from './category-and-color-fields';
import { VisibilityFields } from './visibility-fields';
import { getCategoryLabel } from '@/types/planner.types';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';
import type { PlannerEvent, RecurrenceOption } from '@/types/planner.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save changes'}
    </Button>
  );
}

export function EventChip({
  event,
  canManage,
  onDragStart,
}: {
  event: PlannerEvent;
  canManage: boolean;
  onDragStart?: (event: PlannerEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateEventAction, { error: null });
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteEventAction(event.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        draggable={canManage}
        onDragStart={(e) => {
          if (!canManage) return;
          e.dataTransfer.setData('text/plain', event.occurrenceKey);
          onDragStart?.(event);
        }}
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full flex-col gap-0.5 rounded-md border-l-4 px-2 py-1.5 text-left text-xs transition-colors hover:brightness-95',
          canManage && 'cursor-grab active:cursor-grabbing'
        )}
        style={{ borderColor: event.color, backgroundColor: `${event.color}1A` }}
      >
        <span className="flex items-center gap-1 font-medium text-dusk-700 dark:text-linen-100">
          {event.isRecurring && <Repeat className="h-3 w-3 shrink-0" style={{ color: event.color }} />}
          {event.isMasked && <Lock className="h-3 w-3 shrink-0 text-dusk-400" />}
          <span className="truncate">{event.title}</span>
        </span>
        <span className="text-dusk-400 dark:text-dusk-300">{formatTime(event.startsAt)}</span>
      </button>

      <Modal open={open} onOpenChange={setOpen} title={canManage ? 'Edit event' : event.title}>
        {canManage ? (
          <form action={formAction} className="mt-4 flex flex-col gap-4">
            <input type="hidden" name="eventId" value={event.id} />

            {event.isRecurring && (
              <Alert>
                <AlertDescription>
                  This is a repeating event. Changes here apply to every upcoming occurrence.
                </AlertDescription>
              </Alert>
            )}

            {(state.error || deleteError) && (
              <Alert variant="destructive">
                <AlertDescription>{state.error ?? deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue={event.title}
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={toDateParam(new Date(event.startsAt))}
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="startTime"
                  className="text-sm font-medium text-dusk-600 dark:text-linen-200"
                >
                  Start time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  defaultValue={new Date(event.startsAt).toTimeString().slice(0, 5)}
                  className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="endTime"
                  className="text-sm font-medium text-dusk-600 dark:text-linen-200"
                >
                  End time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue={event.endsAt ? new Date(event.endsAt).toTimeString().slice(0, 5) : ''}
                  className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                />
              </div>
            </div>

            <RecurrenceSelect defaultValue={(event.recurrenceRule as RecurrenceOption) ?? 'none'} />

            <CategoryAndColorFields defaultCategory={event.category} defaultColor={event.color} />

            <VisibilityFields
              defaultFamilyVisible={event.isFamilyVisible}
              defaultPrivacy={event.privacy}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-dusk-600 dark:text-linen-200"
              >
                Notes
              </label>
              <TextareaWithEmoji
                id="description"
                name="description"
                rows={2}
                defaultValue={event.description ?? ''}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending}
                className="gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-2 flex flex-col gap-2 text-sm text-dusk-500 dark:text-dusk-200">
            <p>
              {new Date(event.startsAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {formatTime(event.startsAt)}
              {event.endsAt ? ` – ${formatTime(event.endsAt)}` : ''}
            </p>
            <p className="text-xs text-dusk-300">{getCategoryLabel(event.category)}</p>
            {event.description && <p>{event.description}</p>}
            {event.creatorName && <p className="text-xs text-dusk-300">Added by {event.creatorName}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}
