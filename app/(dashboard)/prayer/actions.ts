'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
}

// ----------------------------------------------------------------------------
// Prayer Requests
// ----------------------------------------------------------------------------
export async function createPrayerRequestAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const familyId = String(formData.get('familyId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'general');
  const groupId = String(formData.get('visibleToGroupId') ?? '').trim();

  if (!title) return { error: 'Title is required.' };

  const { error } = await (supabase as any).from('prayer_requests').insert({
    family_id: familyId,
    created_by: user.id,
    title,
    description: description || null,
    category,
    visible_to_group_id: groupId || null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.prayer);
  return { error: null };
}

export async function togglePrayAction(requestId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('toggle_pray_for_request', {
    p_request_id: requestId,
  });

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}

export async function markPrayerAnsweredAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const requestId = String(formData.get('requestId') ?? '');
  const answerNote = String(formData.get('answerNote') ?? '').trim();

  const { error } = await (supabase as any).rpc('mark_prayer_answered', {
    p_request_id: requestId,
    p_answer_note: answerNote || null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.prayer);
  return { error: null };
}

export async function unmarkPrayerAnsweredAction(requestId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('unmark_prayer_answered', { p_request_id: requestId });

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}

export async function deletePrayerRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('prayer_requests').delete().eq('id', requestId);

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Prayer Journal
// ----------------------------------------------------------------------------
export async function createJournalEntryAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const entryDate = String(formData.get('entryDate') ?? '');
  const isShared = formData.get('isShared') === 'on';
  const familyId = String(formData.get('familyId') ?? '').trim();

  if (!content) return { error: 'Write something first.' };

  const { error } = await (supabase as any).from('prayer_journal_entries').insert({
    user_id: user.id,
    family_id: familyId || null,
    title: title || null,
    content,
    entry_date: entryDate || new Date().toISOString().slice(0, 10),
    is_shared: isShared,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.prayer);
  return { error: null };
}

export async function deleteJournalEntryAction(entryId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('prayer_journal_entries').delete().eq('id', entryId);

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Prayer Reminders (moved here from the Reminders module, now shareable)
// ----------------------------------------------------------------------------
export async function createPrayerReminderAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const label = String(formData.get('label') ?? '').trim();
  const timeOfDay = String(formData.get('timeOfDay') ?? '');
  const days = formData.getAll('daysOfWeek').map((d) => Number(d));
  const shareWithFamily = formData.get('shareWithFamily') === 'on';
  const familyId = String(formData.get('familyId') ?? '').trim();

  if (!label) return { error: 'A label is required.' };
  if (!timeOfDay) return { error: 'A time is required.' };
  if (days.length === 0) return { error: 'Pick at least one day.' };

  const { error } = await (supabase as any).from('prayer_reminders').insert({
    user_id: user.id,
    label,
    time_of_day: timeOfDay,
    days_of_week: days,
    family_id: shareWithFamily ? familyId || null : null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.prayer);
  return { error: null };
}

export async function togglePrayerReminderActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('prayer_reminders')
    .update({ is_active: isActive })
    .eq('id', id);

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}

export async function deletePrayerReminderAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('prayer_reminders').delete().eq('id', id);

  revalidatePath(ROUTES.prayer);
  return { error: error?.message ?? null };
}
