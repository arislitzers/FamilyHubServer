import { createClient } from '@/lib/supabase/server';
import type { CheckIn, PrayerReminder, Reminder } from '@/types/reminders.types';

export async function getMyReminders(userId: string): Promise<Reminder[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('remind_at', { ascending: true });

  if (error || !data) {
    if (error) console.error('getMyReminders error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    title: row.title,
    notes: row.notes,
    remindAt: row.remind_at,
    isCompleted: row.is_completed,
  }));
}

export async function getMyPrayerReminders(userId: string): Promise<PrayerReminder[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('prayer_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('time_of_day', { ascending: true });

  if (error || !data) {
    if (error) console.error('getMyPrayerReminders error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    label: row.label,
    timeOfDay: row.time_of_day,
    daysOfWeek: row.days_of_week,
    isActive: row.is_active,
  }));
}

export async function getFamilyCheckIns(familyId: string, limit = 25): Promise<CheckIn[]> {
  const supabase = createClient();

  // Cast to `any` for this embedded-resource select — see the note in
  // services/families.service.ts about hand-written types + joins.
  const { data, error } = await (supabase as any)
    .from('check_ins')
    .select('id, family_id, user_id, status, note, location_label, created_at, users(full_name, avatar_url)')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('getFamilyCheckIns error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    familyId: row.family_id,
    userId: row.user_id,
    status: row.status,
    note: row.note,
    locationLabel: row.location_label,
    createdAt: row.created_at,
    authorName: row.users?.full_name ?? null,
    authorAvatarUrl: row.users?.avatar_url ?? null,
  }));
}
