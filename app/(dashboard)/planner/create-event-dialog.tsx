'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { createEventAction } from './actions';
import { toDateParam } from '@/lib/date-utils';
import { RecurrenceSelect } from './recurrence-select';
import { CategoryAndColorFields } from './category-and-color-fields';
import { VisibilityFields } from './visibility-fields';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add event'}
    </Button>
  );
}

export function CreateEventDialog({
  familyId,
  defaultDate,
  compact = false,
}: {
  familyId: string;
  defaultDate: Date;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createEventAction, { error: null });

  return (
    <>
      {compact ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-linen-400 py-1.5 text-xs text-dusk-400 transition-colors hover:border-hearth-300 hover:text-hearth-500 dark:border-dusk-500 dark:text-dusk-300"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add event
        </Button>
      )}

      <Modal open={open} onOpenChange={setOpen} title="Add a planner event">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
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
              placeholder="Family dinner"
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
              defaultValue={toDateParam(defaultDate)}
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
                defaultValue="09:00"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="endTime" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                End time <span className="text-dusk-300">(optional)</span>
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>
          </div>

          <RecurrenceSelect />

          <CategoryAndColorFields />

          <VisibilityFields />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-dusk-600 dark:text-linen-200"
            >
              Notes <span className="text-dusk-300">(optional)</span>
            </label>
            <TextareaWithEmoji
              id="description"
              name="description"
              rows={2}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
