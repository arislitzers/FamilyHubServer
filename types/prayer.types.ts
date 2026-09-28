export type PrayerCategory = 'health' | 'family' | 'guidance' | 'thanksgiving' | 'general' | 'other';

export const PRAYER_CATEGORY_OPTIONS: { value: PrayerCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'health', label: 'Health' },
  { value: 'family', label: 'Family' },
  { value: 'guidance', label: 'Guidance' },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'other', label: 'Other' },
];

export interface PrayerRequest {
  id: string;
  familyId: string;
  createdBy: string;
  authorName: string | null;
  authorAvatar: string | null;
  title: string;
  description: string | null;
  category: PrayerCategory;
  visibleToGroupId: string | null;
  groupName: string | null;
  isAnswered: boolean;
  answeredAt: string | null;
  answerNote: string | null;
  prayCount: number;
  iAmPraying: boolean;
  createdAt: string;
}

export interface PrayerJournalEntry {
  id: string;
  userId: string;
  familyId: string | null;
  title: string | null;
  content: string;
  entryDate: string;
  isShared: boolean;
  createdAt: string;
}

export interface PrayerGroupOption {
  chatId: string;
  name: string;
}
