'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { updateFamilyDetailsAction } from '@/app/(dashboard)/family/actions';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';
import type { FamilySummary } from '@/types/family.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save changes'}
    </Button>
  );
}

export function EditFamilyDialog({ family }: { family: FamilySummary }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateFamilyDetailsAction, { error: null });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Pencil className="h-4 w-4" /> Edit family
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Edit family details">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={family.id} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Family name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={family.name}
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-dusk-600 dark:text-linen-200"
            >
              Description
            </label>
            <TextareaWithEmoji
              id="description"
              name="description"
              rows={3}
              defaultValue={family.description ?? ''}
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
