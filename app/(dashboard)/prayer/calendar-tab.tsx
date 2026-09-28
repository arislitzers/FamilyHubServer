'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, HandHeart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addDays, isSameDay, startOfMonthGrid } from '@/lib/date-utils';
import { getPrayerOccurrencesByDay, toDayKey } from '@/lib/schedule-utils';
import type { PrayerReminder } from '@/types/reminders.types';
import type { PrayerRequest } from '@/types/prayer.types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function PrayerCalendarTab({
  reminders,
  activeRequests,
  answeredRequests,
}: {
  reminders: PrayerReminder[];
  activeRequests: PrayerRequest[];
  answeredRequests: PrayerRequest[];
}) {
  const [monthDate, setMonthDate] = useState(new Date());
  const today = new Date();

  const gridStart = startOfMonthGrid(monthDate);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const gridEnd = addDays(gridStart, 42);

  const reminderDays = useMemo(
    () => getPrayerOccurrencesByDay(reminders, gridStart, gridEnd),
    [reminders, gridStart, gridEnd]
  );

  const requestDaysByKey = useMemo(() => {
    const map = new Map<string, PrayerRequest[]>();
    for (const request of activeRequests) {
      const key = toDayKey(request.createdAt);
      map.set(key, [...(map.get(key) ?? []), request]);
    }
    return map;
  }, [activeRequests]);

  const answeredDaysByKey = useMemo(() => {
    const map = new Map<string, PrayerRequest[]>();
    for (const request of answeredRequests) {
      if (!request.answeredAt) continue;
      const key = toDayKey(request.answeredAt);
      map.set(key, [...(map.get(key) ?? []), request]);
    }
    return map;
  }, [answeredRequests]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[9rem] text-center text-sm font-medium text-dusk-600 dark:text-linen-200">
          {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setMonthDate(new Date())}>
          Today
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-dusk-400 dark:text-dusk-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-hearth-400" /> Prayer reminder
        </span>
        <span className="flex items-center gap-1.5">
          <HandHeart className="h-3.5 w-3.5 text-dusk-400" /> Request shared
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-sage-500" /> Prayer answered
        </span>
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
          const key = toDayKey(day);
          const isCurrentMonth = day.getMonth() === monthDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayReminders = reminderDays.get(key) ?? [];
          const dayRequests = requestDaysByKey.get(key) ?? [];
          const dayAnswered = answeredDaysByKey.get(key) ?? [];

          const tooltipParts = [
            ...dayReminders.map((r) => `Prayer reminder: ${r.label}`),
            ...dayRequests.map((r) => `Request: ${r.title}`),
            ...dayAnswered.map((r) => `Answered: ${r.title}`),
          ];

          return (
            <div
              key={key}
              title={tooltipParts.join('\n') || undefined}
              className={cn(
                'flex min-h-[4.5rem] flex-col gap-1 bg-white p-1.5 dark:bg-dusk-800',
                !isCurrentMonth && 'bg-linen-100/60 dark:bg-dusk-900/40'
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
              <div className="flex flex-wrap gap-1">
                {dayReminders.length > 0 && <Sparkles className="h-3 w-3 text-hearth-400" />}
                {dayRequests.length > 0 && <HandHeart className="h-3 w-3 text-dusk-400" />}
                {dayAnswered.length > 0 && <CheckCircle2 className="h-3 w-3 text-sage-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
