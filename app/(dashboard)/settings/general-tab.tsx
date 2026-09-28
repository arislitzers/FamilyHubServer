'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { updateLanguageAction } from './actions';
import { LANGUAGE_OPTIONS } from '@/types/settings.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </Button>
  );
}

export function GeneralTab({ email, language }: { email: string; language: string }) {
  const [state, formAction] = useFormState(updateLanguageAction, { error: null });
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your FamilyHub sign-in details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dusk-600 dark:text-linen-200">Email</label>
            <input
              value={email}
              disabled
              className="h-10 rounded-md border border-linen-300 bg-linen-100 px-3 text-sm text-dusk-400 dark:border-dusk-600 dark:bg-dusk-900 dark:text-dusk-300"
            />
            <p className="text-xs text-dusk-300 dark:text-dusk-500">
              Contact support to change the email on your account.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Language</CardTitle>
          <CardDescription>The language FamilyHub is displayed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-3">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center gap-3">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="flex-1 sm:max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="language" value={selectedLanguage} />
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
