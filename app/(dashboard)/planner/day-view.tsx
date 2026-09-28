'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addDays, formatTime, isSameDay, toDateParam } from '@/lib/date-utils';
import { CreateEventDialog } from './create-event-dialog';
import { EventChip } from './event-chip';
import { rescheduleEventAction } from './actions';
import type { PlannerEvent } from '@/types/planner.types';

const ROW_HEIGHT_PX = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface PositionedEvent {
  event: PlannerEvent;
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

/** Greedy overlap-column layout: events that overlap in time share the
 * row width side-by-side rather than stacking on top of each other. */
function layoutEvents(events: PlannerEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  const positioned: PositionedEvent[] = [];
  const columnEndTimes: number[] = [];
  const clusters: PositionedEvent[][] = [];
  let currentCluster: PositionedEvent[] = [];
  let clusterEnd = -Infinity;

  for (const event of sorted) {
    const start = new Date(event.startsAt);
    const minutes = start.getHours() * 60 + start.getMinutes();
    const durationMin = event.endsAt
      ? Math.max(20, (new Date(event.endsAt).getTime() - start.getTime()) / 60000)
      : 45;
    const top = (minutes / 60) * ROW_HEIGHT_PX;
    const height = (durationMin / 60) * ROW_HEIGHT_PX;
    const endMinutes = minutes + durationMin;

    let column = 0;
    while (columnEndTimes[column] !== undefined && (columnEndTimes[column] as number) > minutes) column++;
    columnEndTimes[column] = endMinutes;

    const item: PositionedEvent = { event, top, height, column, totalColumns: 1 };

    if (minutes >= clusterEnd) {
      if (currentCluster.length) clusters.push(currentCluster);
      currentCluster = [];
      columnEndTimes.length = 0;
      columnEndTimes[0] = endMinutes;
      item.column = 0;
      clusterEnd = endMinutes;
    } else {
      clusterEnd = Math.max(clusterEnd, endMinutes);
    }
    currentCluster.push(item);
    positioned.push(item);
  }
  if (currentCluster.length) clusters.push(currentCluster);

  for (const cluster of clusters) {
    const totalColumns = Math.max(...cluster.map((c) => c.column)) + 1;
    for (const item of cluster) item.totalColumns = totalColumns;
  }

  return positioned;
}

export function DayView({
  date,
  events,
  familyId,
  currentUserId,
  isAdmin,
}: {
  date: Date;
  events: PlannerEvent[];
  familyId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = new Date();
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<PlannerEvent | null>(null);
  const [, startTransition] = useTransition();

  const dayEvents = events.filter((e) => isSameDay(new Date(e.startsAt), date));
  const positioned = useMemo(() => layoutEvents(dayEvents), [dayEvents]);

  const navigateToDay = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', toDateParam(newDate));
    params.set('view', 'day');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDrop = (hour: number) => {
    setDragOverHour(null);
    if (!draggedEvent) return;

    const original = new Date(draggedEvent.startsAt);
    const durationMs = draggedEvent.endsAt
      ? new Date(draggedEvent.endsAt).getTime() - original.getTime()
      : null;

    const newStart = new Date(date);
    newStart.setHours(hour, 0, 0, 0);

    startTransition(() => {
      rescheduleEventAction(draggedEvent.id, newStart.toISOString(), durationMs);
    });
    setDraggedEvent(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateToDay(addDays(date, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[13rem] text-center text-sm font-medium text-dusk-600 dark:text-linen-200">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateToDay(addDays(date, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateToDay(today)}>
            Today
          </Button>
        </div>
        <CreateEventDialog familyId={familyId} defaultDate={date} />
      </div>

      <div className="rounded-lg border border-linen-300 bg-white dark:border-dusk-600 dark:bg-dusk-800">
        <div className="relative flex">
          <div className="w-14 shrink-0 border-r border-linen-200 dark:border-dusk-700">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: ROW_HEIGHT_PX }}
                className="border-b border-linen-200 px-1.5 pt-1 text-right text-[11px] text-dusk-300 dark:border-dusk-700 dark:text-dusk-500"
              >
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          <div className="relative flex-1">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: ROW_HEIGHT_PX }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverHour(hour);
                }}
                onDragLeave={() => setDragOverHour((h) => (h === hour ? null : h))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(hour);
                }}
                className={cn(
                  'border-b border-linen-200 dark:border-dusk-700',
                  dragOverHour === hour && 'bg-hearth-50 dark:bg-hearth-900/20'
                )}
              />
            ))}

            <div className="pointer-events-none absolute inset-0">
              {positioned.map(({ event, top, height, column, totalColumns }) => {
                const widthPct = 100 / totalColumns;
                return (
                  <div
                    key={event.occurrenceKey}
                    className="pointer-events-auto absolute px-0.5"
                    style={{
                      top,
                      height,
                      left: `${column * widthPct}%`,
                      width: `${widthPct}%`,
                    }}
                  >
                    <EventChip
                      event={event}
                      canManage={isAdmin || event.createdBy === currentUserId}
                      onDragStart={setDraggedEvent}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
