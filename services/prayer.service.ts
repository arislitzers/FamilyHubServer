import { createClient } from '@/lib/supabase/server';
import type { PrayerGroupOption, PrayerJournalEntry, PrayerRequest } from '@/types/prayer.types';

export async function getPrayerRequests(familyId: string, answered: boolean): Promise<PrayerRequest[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_prayer_requests', {
    p_family_id: familyId,
    p_answered: answered,
  });

  if (error || !data) {
    if (error) console.error('getPrayerRequests error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    familyId: row.family_id,
    createdBy: row.created_by,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    title: row.title,
    description: row.description,
    category: row.category,
    visibleToGroupId: row.visible_to_group_id,
    groupName: row.group_name,
    isAnswered: row.is_answered,
    answeredAt: row.answered_at,
    answerNote: row.answer_note,
    prayCount: row.pray_count,
    iAmPraying: row.i_am_praying,
    createdAt: row.created_at,
  }));
}

/** Private groups the current user belongs to — used as the scope picker
 * when posting a prayer request ("whole family" vs a specific group). */
export async function getMyPrayerGroupOptions(familyId: string): Promise<PrayerGroupOption[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_my_chat_threads');

  if (error || !data) {
    if (error) console.error('getMyPrayerGroupOptions error', error);
    return [];
  }

  return data
    .filter((row: any) => row.type === 'group' && row.family_id === familyId)
    .map((row: any) => ({ chatId: row.chat_id, name: row.chat_name ?? 'Group' }));
}

export async function getMyPrayerJournalEntries(userId: string): Promise<PrayerJournalEntry[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('prayer_journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error || !data) {
    if (error) console.error('getMyPrayerJournalEntries error', error);
    return [];
  }

  return data.map(mapJournalRow);
}

/** Journal entries other family members have chosen to share, excluding your own. */
export async function getSharedFamilyJournalEntries(
  familyId: string,
  excludeUserId: string
): Promise<(PrayerJournalEntry & { ownerName: string | null })[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('prayer_journal_entries')
    .select('*, users(full_name, email)')
    .eq('family_id', familyId)
    .eq('is_shared', true)
    .neq('user_id', excludeUserId)
    .order('entry_date', { ascending: false });

  if (error || !data) {
    if (error) console.error('getSharedFamilyJournalEntries error', error);
    return [];
  }

  return data.map((row: any) => ({
    ...mapJournalRow(row),
    ownerName: row.users?.full_name ?? row.users?.email ?? null,
  }));
}

function mapJournalRow(row: any): PrayerJournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    title: row.title,
    content: row.content,
    entryDate: row.entry_date,
    isShared: row.is_shared,
    createdAt: row.created_at,
  };
}

/** Prayer reminders other family members have chosen to share (RLS from
 * database/014_prayer_center.sql permits reading these). */
export async function getFamilySharedPrayerReminders(familyId: string, excludeUserId: string) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('prayer_reminders')
    .select('id, user_id, label, time_of_day, days_of_week, is_active, users(full_name)')
    .eq('family_id', familyId)
    .neq('user_id', excludeUserId)
    .eq('is_active', true)
    .order('time_of_day', { ascending: true });

  if (error || !data) {
    if (error) console.error('getFamilySharedPrayerReminders error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    label: row.label,
    timeOfDay: row.time_of_day,
    daysOfWeek: row.days_of_week,
    isActive: row.is_active,
    ownerName: row.users?.full_name ?? 'A family member',
  }));
}
