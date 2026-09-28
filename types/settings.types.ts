export interface NotificationPreferences {
  message: boolean;
  family_member_added: boolean;
  role_changed: boolean;
  planner_event: boolean;
  check_in: boolean;
  reminder_shared: boolean;
  join_request: boolean;
  media_uploaded: boolean;
  prayer_request: boolean;
  prayer_answered: boolean;
}

export interface UserSettingsRecord {
  userId: string;
  theme: string;
  colorTheme: string;
  notificationPreferences: NotificationPreferences;
  language: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<keyof NotificationPreferences, { label: string; description: string }> = {
  message: {
    label: 'New messages',
    description: 'When someone sends a message in a chat you\u2019re part of',
  },
  family_member_added: {
    label: 'Joining a family',
    description: "When you're added to a family",
  },
  role_changed: {
    label: 'Role changes',
    description: 'When your role in a family changes',
  },
  planner_event: {
    label: 'New planner events',
    description: 'When someone adds an event to the family planner',
  },
  check_in: {
    label: 'Check-ins',
    description: 'When a family member posts a check-in',
  },
  reminder_shared: {
    label: 'Shared reminders',
    description: 'When someone shares a reminder with the family',
  },
  join_request: {
    label: 'Join requests',
    description: 'When someone asks to join using your family code (admins only)',
  },
  media_uploaded: {
    label: 'New photos & files',
    description: 'When someone adds a photo or file to the family gallery',
  },
  prayer_request: {
    label: 'Prayer requests',
    description: 'When someone shares a prayer request with you',
  },
  prayer_answered: {
    label: 'Answered prayers',
    description: "When a prayer you're praying for is marked answered",
  },
};

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
  { value: 'sw', label: 'Kiswahili' },
] as const;
