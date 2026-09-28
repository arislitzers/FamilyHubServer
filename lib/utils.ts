import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes intelligently, resolving conflicts
 * (e.g. cn('p-2', condition && 'p-4') -> 'p-4' wins).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a Date (or ISO string) into a short, human-friendly label. */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d);
}

/** Builds initials from a display name, e.g. "Ariel Njoya" -> "AN". */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Simple sleep helper, useful for placeholder/loading states. */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
