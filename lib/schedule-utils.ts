import type { PrayerReminder } from '@/types/reminders.types';
import type { FamilyProfileDetail } from '@/types/family.types';

export interface UpcomingBirthday {
  familyMemberId: string;
  name: string;
  avatarUrl: string | null;
  daysUntil: number;
  turningAge: number | null;
  nextDate: Date;
}

/**
 * Computes each family member's next birthday occurrence (this year or
 * next, whichever is soonest) and returns the closest `limit` — skipping
 * anyone without a birthday set, or whose birthday is marked private and
 * this viewer isn't allowed to see it (get_family_profiles already
 * nulled it out server-side in that case, so this just naturally excludes
 * them).
 */
export function getUpcomingBirthdays(
  profiles: FamilyProfileDetail[],
  limit = 5
): UpcomingBirthday[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: UpcomingBirthday[] = [];

  for (const profile of profiles) {
    if (!profile.birthday) continue;

    const birthDate = new Date(`${profile.birthday}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) continue;

    let nextDate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextDate < today) {
      nextDate = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const daysUntil = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const turningAge = nextDate.getFullYear() - birthDate.getFullYear();

    upcoming.push({
      familyMemberId: profile.familyMemberId,
      name: profile.nickname || profile.displayName || profile.fullName || profile.accountEmail,
      avatarUrl: profile.avatarUrl,
      daysUntil,
      turningAge: turningAge > 0 ? turningAge : null,
      nextDate,
    });
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, limit);
}

export interface NextPrayerOccurrence {
  reminder: PrayerReminder;
  daysUntil: number; // 0 = later today
  label: string; // "Today at 6:00 PM", "Tomorrow at 7:00 AM", "Friday at 6:00 PM"
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Finds the single soonest upcoming occurrence across every active prayer
 * reminder, walking forward up to 7 days to respect each reminder's
 * days-of-week + time-of-day.
 */
export function getNextPrayerOccurrence(reminders: PrayerReminder[]): NextPrayerOccurrence | null {
  const active = reminders.filter((r) => r.isActive && r.daysOfWeek.length > 0);
  if (active.length === 0) return null;

  const now = new Date();
  let best: { occurrence: NextPrayerOccurrence; timestamp: number } | null = null;

  for (const reminder of active) {
    const [hoursRaw, minutesRaw] = reminder.timeOfDay.split(':').map(Number);
    const hours = hoursRaw ?? 0;
    const minutes = minutesRaw ?? 0;

    for (let offset = 0; offset < 8; offset++) {
      const candidateDate = new Date(now);
      candidateDate.setDate(candidateDate.getDate() + offset);
      candidateDate.setHours(hours, minutes, 0, 0);

      if (!reminder.daysOfWeek.includes(candidateDate.getDay())) continue;
      if (candidateDate < now) continue;

      const daysUntil = Math.floor(
        (new Date(candidateDate).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );

      const timeLabel = candidateDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      const dayLabel =
        daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : WEEKDAY_NAMES[candidateDate.getDay()];

      const occurrence: NextPrayerOccurrence = {
        reminder,
        daysUntil,
        label: `${dayLabel} at ${timeLabel}`,
      };

      if (!best || candidateDate.getTime() < best.timestamp) {
        best = { occurrence, timestamp: candidateDate.getTime() };
      }

      break; // found this reminder's next occurrence, move to the next reminder
    }
  }

  return best?.occurrence ?? null;
}

/**
 * All prayer reminder occurrences (active reminders only) that fall on
 * each calendar day within [rangeStart, rangeEnd) — used by the Prayer
 * Calendar's month grid, which needs every occurrence in the visible
 * month, not just the single soonest one getNextPrayerOccurrence returns.
 * Returns a map of "YYYY-MM-DD" -> reminders scheduled that day.
 */
export function getPrayerOccurrencesByDay(
  reminders: PrayerReminder[],
  rangeStart: Date,
  rangeEnd: Date
): Map<string, PrayerReminder[]> {
  const byDay = new Map<string, PrayerReminder[]>();
  const active = reminders.filter((r) => r.isActive && r.daysOfWeek.length > 0);

  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);

  while (cursor < rangeEnd) {
    const dayOfWeek = cursor.getDay();
    const matches = active.filter((r) => r.daysOfWeek.includes(dayOfWeek));
    if (matches.length > 0) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      byDay.set(key, matches);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return byDay;
}

export function toDayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
