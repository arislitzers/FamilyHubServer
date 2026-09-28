'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { WEEKDAY_LABELS } from '@/types/reminders.types';
import { createPrayerReminderAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add prayer reminder'}
    </Button>
  );
}

export function CreatePrayerReminderDialog({ familyId }: { familyId: string | null }) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [state, formAction] = useFormState(createPrayerReminderAction, { error: null });

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> New prayer reminder
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="New prayer reminder">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {familyId && <input type="hidden" name="familyId" value={familyId} />}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="label" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Label
            </label>
            <input
              id="label"
              name="label"
              required
              placeholder="Evening prayer"
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timeOfDay" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Time
            </label>
            <input
              id="timeOfDay"
              name="timeOfDay"
              type="time"
              required
              defaultValue="18:00"
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-dusk-600 dark:text-linen-200">Days</span>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'h-9 w-11 rounded-md border text-xs font-medium transition-colors',
                    selectedDays.includes(day)
                      ? 'border-hearth-400 bg-hearth-100 text-hearth-700 dark:bg-hearth-900/40 dark:text-hearth-200'
                      : 'border-linen-300 text-dusk-400 dark:border-dusk-600 dark:text-dusk-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedDays.map((day) => (
              <input key={day} type="hidden" name="daysOfWeek" value={day} />
            ))}
          </div>

          {familyId && (
            <label className="flex items-center gap-2 text-sm text-dusk-600 dark:text-linen-200">
              <input type="checkbox" name="shareWithFamily" className="h-4 w-4 rounded border-linen-400" />
              Share with my family (they can see it, only you control it)
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
