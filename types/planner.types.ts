export type RecurrenceOption = 'none' | 'daily' | 'weekly' | 'monthly';

export type EventCategory =
  | 'family'
  | 'work'
  | 'school'
  | 'health'
  | 'birthday'
  | 'holiday'
  | 'personal'
  | 'other';

export type EventPrivacy = 'public' | 'private';

export interface PlannerEvent {
  id: string; // base event id — recurring occurrences share this
  occurrenceKey: string; // unique per rendered instance, e.g. `${id}_${startsAt}`
  familyId: string;
  createdBy: string;
  creatorName: string | null;
  title: string; // becomes "Busy" when isMasked is true
  description: string | null; // null when isMasked is true
  startsAt: string; // this specific occurrence's start (ISO)
  endsAt: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  category: EventCategory;
  color: string; // resolved hex to render with (explicit override or category default)
  isFamilyVisible: boolean;
  privacy: EventPrivacy;
  isMasked: boolean; // true when we're seeing the "Busy" placeholder, not the real details
}

export const CATEGORY_OPTIONS: { value: EventCategory; label: string; color: string }[] = [
  { value: 'family', label: 'Family', color: '#E08E45' }, // hearth
  { value: 'work', label: 'Work', color: '#4C5578' }, // twilight
  { value: 'school', label: 'School', color: '#5E7A67' }, // sage-500
  { value: 'health', label: 'Health', color: '#C4693A' }, // ember
  { value: 'birthday', label: 'Birthday', color: '#D97BAE' }, // pink accent
  { value: 'holiday', label: 'Holiday', color: '#3B8FB0' }, // teal accent
  { value: 'personal', label: 'Personal', color: '#7C6A5C' }, // warm neutral
  { value: 'other', label: 'Other', color: '#8888A0' }, // muted gray
];

export function getCategoryDefaultColor(category: EventCategory): string {
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.color ?? '#E08E45';
}

export function getCategoryLabel(category: EventCategory): string {
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? 'Other';
}

/** A small curated swatch set for the color override picker — kept short
 * on purpose so choosing a color stays quick, not a full color wheel. */
export const COLOR_SWATCHES = [
  '#E08E45', // hearth
  '#4C5578', // twilight
  '#5E7A67', // sage
  '#C4693A', // ember
  '#D97BAE', // pink
  '#3B8FB0', // teal
  '#7C6A5C', // warm neutral
  '#8888A0', // muted gray
];
