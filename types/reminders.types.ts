export interface Reminder {
  id: string;
  userId: string;
  familyId: string | null;
  title: string;
  notes: string | null;
  remindAt: string; // ISO timestamp
  isCompleted: boolean;
}

export interface PrayerReminder {
  id: string;
  userId: string;
  label: string;
  timeOfDay: string; // HH:MM:SS
  daysOfWeek: number[]; // 0 (Sun) – 6 (Sat)
  isActive: boolean;
}

export interface CheckIn {
  id: string;
  familyId: string;
  userId: string;
  status: string;
  note: string | null;
  locationLabel: string | null;
  createdAt: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
}

export const CHECK_IN_STATUSES = [
  'Arrived safely',
  'On my way',
  'At work',
  'At school',
  "Feeling good",
  'Need a hand',
] as const;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
