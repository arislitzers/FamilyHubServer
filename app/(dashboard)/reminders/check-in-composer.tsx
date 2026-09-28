'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { CHECK_IN_STATUSES } from '@/types/reminders.types';
import { createCheckInAction } from './actions';
import { InputWithEmoji } from '@/components/shared/input-with-emoji';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
      <Send className="h-3.5 w-3.5" /> {pending ? 'Posting...' : 'Post check-in'}
    </Button>
  );
}

export function CheckInComposer({ familyId }: { familyId: string }) {
  const [state, formAction] = useFormState(createCheckInAction, { error: null });
  const [status, setStatus] = useState<string>(CHECK_IN_STATUSES[0]);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-1.5">
            {CHECK_IN_STATUSES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={
                  status === option
                    ? 'rounded-full bg-hearth-400 px-3 py-1 text-xs font-medium text-white'
                    : 'rounded-full border border-linen-300 px-3 py-1 text-xs text-dusk-500 hover:border-hearth-300 dark:border-dusk-600 dark:text-dusk-200'
                }
              >
                {option}
              </button>
            ))}
          </div>
          <input type="hidden" name="status" value={status} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <InputWithEmoji
              name="note"
              placeholder="Add a quick note (optional)"
              className="h-9 flex-1 dark:bg-dusk-900"
            />
            <input
              name="locationLabel"
              placeholder="Location (optional)"
              className="h-9 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-900 dark:text-linen-100 sm:w-40"
            />
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
