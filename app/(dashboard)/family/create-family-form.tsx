'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createFamilyAction } from '@/app/(dashboard)/family/actions';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Creating...' : 'Create family'}
    </Button>
  );
}

export function CreateFamilyForm() {
  const [state, formAction] = useFormState(createFamilyAction, { error: null });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl text-dusk-700 dark:text-linen-100">
          Set up your family&apos;s space
        </h1>
        <p className="mt-1 text-sm text-dusk-400 dark:text-dusk-200">
          Give your family a name to get started. You can invite everyone else next.
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
              <label htmlFor="name" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Family name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="The Njoya Family"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-dusk-600 dark:text-linen-200"
              >
                Description <span className="text-dusk-300">(optional)</span>
              </label>
              <TextareaWithEmoji
                id="description"
                name="description"
                rows={3}
                placeholder="A little about your family..."
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
