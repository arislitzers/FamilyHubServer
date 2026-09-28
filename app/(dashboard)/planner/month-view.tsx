'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Lock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addDays, isSameDay, startOfMonthGrid, toDateParam } from '@/lib/date-utils';
import { CreateEventDialog } from './create-event-dialog';
import { rescheduleEventAction } from './actions';
import type { PlannerEvent } from '@/types/planner.types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE_PER_DAY = 3;

export function MonthView({
  monthDate,
  events,
  familyId,
  currentUserId,
  isAdmin,
}: {
  monthDate: Date;
  events: PlannerEvent[];
  familyId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = new Date();
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<PlannerEvent | null>(null);
  const [, startTransition] = useTransition();

  const gridStart = startOfMonthGrid(monthDate);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const navigateToMonth = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', toDateParam(newDate));
    params.set('view', 'month');
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToDay = (day: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', toDateParam(day));
    params.set('view', 'day');
    router.push(`${pathname}?${params.toString()}`);
  };

  const eventsByDay = (day: Date) => events.filter((e) => isSameDay(new Date(e.startsAt), day));

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
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateToMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[9rem] text-center text-sm font-medium text-dusk-600 dark:text-linen-200">
            {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateToMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateToMonth(today)}>
            Today
          </Button>
        </div>
        <CreateEventDialog familyId={familyId} defaultDate={today} />
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-linen-300 bg-linen-300 dark:border-dusk-600 dark:bg-dusk-600">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-linen-100 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-dusk-400 dark:bg-dusk-800 dark:text-dusk-300"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const dayEvents = eventsByDay(day);
          const isCurrentMonth = day.getMonth() === monthDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayKey = day.toISOString();
          const visible = dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
          const overflowCount = dayEvents.length - visible.length;

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
              onClick={() => goToDay(day)}
              className={cn(
                'flex min-h-[6.5rem] cursor-pointer flex-col gap-1 bg-white p-1.5 transition-colors dark:bg-dusk-800',
                !isCurrentMonth && 'bg-linen-100/60 dark:bg-dusk-900/40',
                dragOverDay === dayKey && 'bg-hearth-50 dark:bg-hearth-900/20'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday
                    ? 'bg-hearth-400 text-white'
                    : isCurrentMonth
                      ? 'text-dusk-600 dark:text-linen-200'
                      : 'text-dusk-300 dark:text-dusk-500'
                )}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-0.5">
                {visible.map((event) => (
                  <div
                    key={event.occurrenceKey}
                    draggable={isAdmin || event.createdBy === currentUserId}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData('text/plain', event.occurrenceKey);
                      setDraggedEvent(event);
                    }}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] text-dusk-700 dark:text-linen-100"
                    style={{ backgroundColor: `${event.color}22` }}
                  >
                    {event.isRecurring && <Repeat className="h-2.5 w-2.5 shrink-0" />}
                    {event.isMasked && <Lock className="h-2.5 w-2.5 shrink-0" />}
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
                {overflowCount > 0 && (
                  <span className="text-[10px] text-dusk-300 dark:text-dusk-500">
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
