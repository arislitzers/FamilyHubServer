const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns a new Date at local midnight for the given date. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Returns the Monday that starts the week containing `date`, at local
 * midnight. Weeks run Monday–Sunday throughout the Planner UI.
 */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday back to the prior Monday
  return addDays(d, diff);
}

/** The 7 dates (Mon–Sun) belonging to the week that starts on `weekStart`. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Formats a week range as e.g. "Jul 21 – Jul 27, 2026". */
export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = weekEnd.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}

/** YYYY-MM-DD, safe for use as a URL search param or <input type="date"> value. */
export function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateParam(param: string | undefined): Date {
  if (!param) return new Date();
  const parsed = new Date(`${param}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** e.g. "9:30 AM" from an ISO timestamp. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * The Monday that starts the 6-week (42-day) grid a month view renders —
 * i.e. the Monday on/before the 1st of the month. Shared between the
 * server-side range fetch and the client-side MonthView grid so they can
 * never drift out of sync with each other.
 */
export function startOfMonthGrid(date: Date): Date {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfWeek(firstOfMonth);
}
