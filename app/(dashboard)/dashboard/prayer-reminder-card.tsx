import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { NextPrayerOccurrence } from '@/lib/schedule-utils';

export function PrayerReminderCard({ next }: { next: NextPrayerOccurrence | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" /> Prayer reminder
        </CardTitle>
      </CardHeader>
      <CardContent>
        {next ? (
          <div>
            <p className="font-display text-lg text-dusk-700 dark:text-linen-100">
              {next.reminder.label}
            </p>
            <p className="text-sm text-dusk-400 dark:text-dusk-300">{next.label}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-dusk-300 dark:text-dusk-500">
              No active prayer reminders set.
            </p>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href={ROUTES.prayer}>Set one up</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
