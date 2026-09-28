'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { updateNotificationPreferenceAction } from './actions';
import { NOTIFICATION_TYPE_LABELS, type NotificationPreferences } from '@/types/settings.types';

export function NotificationsSettingsTab({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  const [prefs, setPrefs] = useState(preferences);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: keyof NotificationPreferences) => {
    const nextValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: nextValue }));
    setError(null);
    startTransition(async () => {
      const result = await updateNotificationPreferenceAction(key, nextValue);
      if (result.error) {
        setError(result.error);
        setPrefs((prev) => ({ ...prev, [key]: !nextValue }));
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
        <CardDescription>Choose what FamilyHub notifies you about.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(Object.keys(NOTIFICATION_TYPE_LABELS) as (keyof NotificationPreferences)[]).map((key) => {
          const { label, description } = NOTIFICATION_TYPE_LABELS[key];
          const isOn = prefs[key];

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border-b border-linen-200 py-3 last:border-0 dark:border-dusk-700"
            >
              <div>
                <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{label}</p>
                <p className="text-xs text-dusk-400 dark:text-dusk-300">{description}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                disabled={isPending}
                aria-label={`Toggle ${label}`}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                  isOn ? 'bg-hearth-400' : 'bg-linen-400 dark:bg-dusk-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
                    isOn ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
