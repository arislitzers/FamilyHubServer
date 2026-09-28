'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
}

// ----------------------------------------------------------------------------
// Reminders
// ----------------------------------------------------------------------------
export async function createReminderAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const title = String(formData.get('title') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const date = String(formData.get('date') ?? '');
  const time = String(formData.get('time') ?? '09:00');
  const shareWithFamily = formData.get('shareWithFamily') === 'on';
  const familyId = String(formData.get('familyId') ?? '') || null;

  if (!title) return { error: 'Title is required.' };
  if (!date) return { error: 'A date is required.' };

  const remindAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(remindAt.getTime())) return { error: 'Invalid date or time.' };

  const { error } = await (supabase as any).from('reminders').insert({
    user_id: user.id,
    family_id: shareWithFamily ? familyId : null,
    title,
    notes: notes || null,
    remind_at: remindAt.toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.reminders);
  return { error: null };
}

export async function toggleReminderAction(id: string, isCompleted: boolean): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('reminders')
    .update({ is_completed: isCompleted })
    .eq('id', id);

  revalidatePath(ROUTES.reminders);
  return { error: error?.message ?? null };
}

export async function deleteReminderAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('reminders').delete().eq('id', id);

  revalidatePath(ROUTES.reminders);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Check-Ins
// ----------------------------------------------------------------------------
export async function createCheckInAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const familyId = String(formData.get('familyId') ?? '');
  const status = String(formData.get('status') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const locationLabel = String(formData.get('locationLabel') ?? '').trim();

  if (!familyId) return { error: 'No family found.' };
  if (!status) return { error: 'Pick a status.' };

  const { error } = await (supabase as any).from('check_ins').insert({
    family_id: familyId,
    user_id: user.id,
    status,
    note: note || null,
    location_label: locationLabel || null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.reminders);
  return { error: null };
}

export async function deleteCheckInAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('check_ins').delete().eq('id', id);

  revalidatePath(ROUTES.reminders);
  return { error: error?.message ?? null };
}
