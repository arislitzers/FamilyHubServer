'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { requestToJoinFamilyAction } from '@/app/(dashboard)/family/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Sending request...' : 'Request to join'}
    </Button>
  );
}

export function JoinFamilyForm() {
  const [state, formAction] = useFormState(requestToJoinFamilyAction, { error: null });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl text-dusk-700 dark:text-linen-100">
          Join an existing family
        </h1>
        <p className="mt-1 text-sm text-dusk-400 dark:text-dusk-200">
          Ask a family admin for their family code. They&apos;ll need to approve your request.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form action={formAction} className="flex flex-col gap-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="familyCode"
                className="text-sm font-medium text-dusk-600 dark:text-linen-200"
              >
                Family code
              </label>
              <input
                id="familyCode"
                name="familyCode"
                required
                placeholder="e.g. 7F3K9QRT"
                autoCapitalize="characters"
                className="h-11 rounded-md border border-linen-300 bg-white px-3 text-center font-mono text-lg uppercase tracking-widest text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
