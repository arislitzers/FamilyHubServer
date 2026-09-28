'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { toDateParam } from '@/lib/date-utils';
import { createJournalEntryAction } from './actions';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save entry'}
    </Button>
  );
}

export function CreateJournalEntryDialog({ familyId }: { familyId: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createJournalEntryAction, { error: null });

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> New journal entry
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="New journal entry">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {familyId && <input type="hidden" name="familyId" value={familyId} />}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Title <span className="text-dusk-300">(optional)</span>
              </label>
              <input
                id="title"
                name="title"
                placeholder="A word for today"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="entryDate" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Date
              </label>
              <input
                id="entryDate"
                name="entryDate"
                type="date"
                defaultValue={toDateParam(new Date())}
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="content" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              What&apos;s on your mind?
            </label>
            <TextareaWithEmoji
              id="content"
              name="content"
              required
              rows={5}
              placeholder="Write freely — this stays private unless you choose to share it."
            />
          </div>

          {familyId && (
            <label className="flex items-center gap-2 text-sm text-dusk-600 dark:text-linen-200">
              <input type="checkbox" name="isShared" className="h-4 w-4 rounded border-linen-400" />
              Share this entry with my family
            </label>
          )}

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
