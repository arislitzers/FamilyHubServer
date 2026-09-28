'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Plus, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createPrayerRequestAction } from './actions';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';
import { PRAYER_CATEGORY_OPTIONS } from '@/types/prayer.types';
import type { PrayerGroupOption } from '@/types/prayer.types';

const WHOLE_FAMILY_VALUE = 'family';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sharing...' : 'Share request'}
    </Button>
  );
}

export function CreatePrayerRequestDialog({
  familyId,
  groups,
}: {
  familyId: string;
  groups: PrayerGroupOption[];
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('general');
  const [shareWith, setShareWith] = useState(WHOLE_FAMILY_VALUE);
  const [state, formAction] = useFormState(createPrayerRequestAction, { error: null });

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> New prayer request
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Share a prayer request">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              What&apos;s on your heart?
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Peace during a hard week"
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Details <span className="text-dusk-300">(optional)</span>
            </label>
            <TextareaWithEmoji id="description" name="description" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRAYER_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="share-with-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Share with
              </label>
              <Select value={shareWith} onValueChange={setShareWith}>
                <SelectTrigger id="share-with-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WHOLE_FAMILY_VALUE}>Whole family</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.chatId} value={g.chatId}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                name="visibleToGroupId"
                value={shareWith === WHOLE_FAMILY_VALUE ? '' : shareWith}
              />
            </div>
          </div>

          {groups.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-dusk-400 dark:text-dusk-300">
              <Lock className="h-3 w-3" /> Sharing with a group keeps it visible only to that
              group&apos;s members, not the whole family.
            </p>
          )}
          {groups.length === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-dusk-300 dark:text-dusk-500">
              <Users className="h-3 w-3" /> Create a private group from Chat to share requests with just
              a few people instead of the whole family.
            </p>
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
