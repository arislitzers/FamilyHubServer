import { createClient } from '@/lib/supabase/server';
import type { NotificationPreferences, UserSettingsRecord } from '@/types/settings.types';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  message: true,
  family_member_added: true,
  role_changed: true,
  planner_event: true,
  check_in: true,
  reminder_shared: true,
  join_request: true,
  media_uploaded: true,
  prayer_request: true,
  prayer_answered: true,
};

export async function getMySettings(userId: string): Promise<UserSettingsRecord> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getMySettings error', error);
    // Falls back to sensible defaults — the handle_new_user trigger
    // (database/007_settings.sql) should mean this row always exists,
    // but staying defensive costs nothing.
    return {
      userId,
      theme: 'system',
      colorTheme: 'hearth',
      notificationPreferences: DEFAULT_PREFERENCES,
      language: 'en',
    };
  }

  return {
    userId: data.user_id,
    theme: data.theme,
    colorTheme: data.color_theme ?? 'hearth',
    notificationPreferences: {
      ...DEFAULT_PREFERENCES,
      ...(data.notification_preferences as Partial<NotificationPreferences>),
    },
    language: data.language,
  };
}
