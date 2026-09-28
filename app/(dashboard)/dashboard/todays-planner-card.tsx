import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/date-utils';
import { ROUTES } from '@/constants/routes';
import type { PlannerEvent } from '@/types/planner.types';

export function TodaysPlannerCard({ events }: { events: PlannerEvent[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" /> Today&apos;s planner
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
          <Link href={ROUTES.planner}>
            Full week <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-4 text-center text-sm text-dusk-300 dark:text-dusk-500">
            Nothing on the calendar today.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-md border-l-4 border-hearth-400 bg-hearth-50 px-3 py-2 dark:bg-hearth-900/20"
              >
                <span className="w-16 shrink-0 text-xs font-medium text-hearth-600 dark:text-hearth-200">
                  {formatTime(event.startsAt)}
                </span>
                <span className="truncate text-sm text-dusk-700 dark:text-linen-100">{event.title}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
