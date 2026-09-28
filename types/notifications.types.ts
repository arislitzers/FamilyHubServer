export type NotificationType =
  | 'message'
  | 'family_member_added'
  | 'role_changed'
  | 'planner_event'
  | 'check_in'
  | 'reminder_shared'
  | 'join_request'
  | 'media_uploaded'
  | 'prayer_request'
  | 'prayer_answered'
  | string;

export interface AppNotification {
  id: string;
  userId: string;
  familyId: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export type NotificationCategoryKey =
  | 'messages'
  | 'family'
  | 'planner'
  | 'reminders'
  | 'prayer'
  | 'media'
  | 'other';

export interface NotificationCategory {
  key: NotificationCategoryKey;
  label: string;
  types: NotificationType[];
}

/**
 * Groups the individual trigger-generated `type` values (see
 * database/006_notifications.sql and 012_notifications_advanced.sql) into
 * a small set of user-facing categories for filtering the notification
 * feed. Any type not listed here falls into "Other" — see
 * getNotificationCategory() below — so a future notification type never
 * silently disappears from the filter.
 */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { key: 'messages', label: 'Messages', types: ['message'] },
  { key: 'family', label: 'Family', types: ['family_member_added', 'role_changed', 'join_request'] },
  { key: 'planner', label: 'Planner', types: ['planner_event'] },
  { key: 'reminders', label: 'Reminders', types: ['reminder_shared', 'check_in'] },
  { key: 'prayer', label: 'Prayer', types: ['prayer_request', 'prayer_answered'] },
  { key: 'media', label: 'Media', types: ['media_uploaded'] },
];

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  const found = NOTIFICATION_CATEGORIES.find((c) => c.types.includes(type));
  return found ?? { key: 'other', label: 'Other', types: [] };
}
