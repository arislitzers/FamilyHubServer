'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  addDays,
  formatWeekRangeLabel,
  getWeekDays,
  isSameDay,
  startOfWeek,
  toDateParam,
} from '@/lib/date-utils';
import { CreateEventDialog } from './create-event-dialog';
import { EventChip } from './event-chip';
import { rescheduleEventAction } from './actions';
import type { PlannerEvent } from '@/types/planner.types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekView({
  weekStart,
  events,
  familyId,
  currentUserId,
  isAdmin,
}: {
  weekStart: Date;
  events: PlannerEvent[];
  familyId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const days = getWeekDays(weekStart);
  const today = new Date();
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [draggedEvent, setDraggedEvent] = useState<PlannerEvent | null>(null);

  const navigateToWeek = (newWeekStart: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', toDateParam(newWeekStart));
    router.push(`${pathname}?${params.toString()}`);
  };

  const eventsByDay = (day: Date) =>
    events.filter((event) => isSameDay(new Date(event.startsAt), day));

  const handleDrop = (day: Date) => {
    setDragOverDay(null);
    if (!draggedEvent) return;

    const original = new Date(draggedEvent.startsAt);
    const newStart = new Date(day);
    newStart.setHours(original.getHours(), original.getMinutes(), 0, 0);

    const durationMs = draggedEvent.endsAt
      ? new Date(draggedEvent.endsAt).getTime() - original.getTime()
      : null;

    startTransition(() => {
      rescheduleEventAction(draggedEvent.id, newStart.toISOString(), durationMs);
    });
    setDraggedEvent(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateToWeek(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[11rem] text-center text-sm font-medium text-dusk-600 dark:text-linen-200">
            {formatWeekRangeLabel(weekStart)}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateToWeek(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateToWeek(startOfWeek(new Date()))}>
            Today
          </Button>
        </div>
        <CreateEventDialog familyId={familyId} defaultDate={today} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsByDay(day);
          const isToday = isSameDay(day, today);
          const dayKey = day.toISOString();

          return (
            <div
              key={dayKey}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDay(dayKey);
              }}
              onDragLeave={() => setDragOverDay((d) => (d === dayKey ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(day);
              }}
              className={cn(
                'flex flex-col gap-2 rounded-lg border bg-white p-3 transition-colors dark:bg-dusk-800',
                dragOverDay === dayKey
                  ? 'border-hearth-400 bg-hearth-50 dark:bg-hearth-900/20'
                  : 'border-linen-300 dark:border-dusk-600'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-dusk-300 dark:text-dusk-400">
                    {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
                  </p>
                  <p
                    className={
                      isToday
                        ? 'text-lg font-semibold text-hearth-500'
                        : 'text-lg font-semibold text-dusk-700 dark:text-linen-100'
                    }
                  >
                    {day.getDate()}
                  </p>
                </div>
                {isToday && <CalendarDays className="h-4 w-4 text-hearth-400" />}
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                {dayEvents.length === 0 ? (
                  <p className="py-2 text-center text-xs text-dusk-300 dark:text-dusk-500">
                    No events
                  </p>
                ) : (
                  dayEvents.map((event) => (
                    <EventChip
                      key={event.occurrenceKey}
                      event={event}
                      canManage={isAdmin || event.createdBy === currentUserId}
                      onDragStart={setDraggedEvent}
                    />
                  ))
                )}
              </div>

              <CreateEventDialog familyId={familyId} defaultDate={day} compact />
            </div>
          );
        })}
      </div>
    </div>
  );
}
