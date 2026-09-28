'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
}

function combineDateAndTime(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  const time = timeStr || '00:00';
  const local = new Date(`${dateStr}T${time}:00`);
  return Number.isNaN(local.getTime()) ? null : local.toISOString();
}

export async function createEventAction(
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
  const date = String(formData.get('date') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const recurrence = String(formData.get('recurrence') ?? 'none');
  const category = String(formData.get('category') ?? 'family');
  const color = String(formData.get('color') ?? '').trim();
  const isFamilyVisible = formData.get('isFamilyVisible') === 'on';
  const privacy = String(formData.get('privacy') ?? 'public');

  if (!title) return { error: 'Title is required.' };

  const startsAt = combineDateAndTime(date, startTime);
  if (!startsAt) return { error: 'A valid date and start time are required.' };

  const endsAt = endTime ? combineDateAndTime(date, endTime) : null;

  const { error } = await (supabase as any).from('planner_events').insert({
    family_id: familyId,
    created_by: user.id,
    title,
    description: description || null,
    starts_at: startsAt,
    ends_at: endsAt,
    is_recurring: recurrence !== 'none',
    recurrence_rule: recurrence !== 'none' ? recurrence : null,
    category,
    color: color || null,
    is_family_visible: isFamilyVisible,
    privacy: isFamilyVisible ? privacy : 'public',
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.planner);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}

export async function updateEventAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();

  const eventId = String(formData.get('eventId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const date = String(formData.get('date') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const recurrence = String(formData.get('recurrence') ?? 'none');
  const category = String(formData.get('category') ?? 'family');
  const color = String(formData.get('color') ?? '').trim();
  const isFamilyVisible = formData.get('isFamilyVisible') === 'on';
  const privacy = String(formData.get('privacy') ?? 'public');

  if (!title) return { error: 'Title is required.' };

  const startsAt = combineDateAndTime(date, startTime);
  if (!startsAt) return { error: 'A valid date and start time are required.' };

  const endsAt = endTime ? combineDateAndTime(date, endTime) : null;

  const { error } = await (supabase as any)
    .from('planner_events')
    .update({
      title,
      description: description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      is_recurring: recurrence !== 'none',
      recurrence_rule: recurrence !== 'none' ? recurrence : null,
      category,
      color: color || null,
      is_family_visible: isFamilyVisible,
      privacy: isFamilyVisible ? privacy : 'public',
    })
    .eq('id', eventId);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.planner);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('planner_events').delete().eq('id', eventId);

  revalidatePath(ROUTES.planner);
  revalidatePath(ROUTES.dashboard);
  return { error: error?.message ?? null };
}

/**
 * Drag-and-drop reschedule: moves an event to a new start time, keeping
 * its original duration. For a recurring event this shifts the template
 * occurrence (its anchor date/weekday for future expansion) rather than
 * just one instance — editing a single occurrence of a series without
 * detaching it is a reasonable next refinement, not done here.
 */
export async function rescheduleEventAction(
  eventId: string,
  newStartsAtIso: string,
  durationMs: number | null
): Promise<ActionResult> {
  const supabase = createClient();

  const newEndsAt = durationMs !== null ? new Date(new Date(newStartsAtIso).getTime() + durationMs).toISOString() : null;

  const { error } = await (supabase as any)
    .from('planner_events')
    .update({ starts_at: newStartsAtIso, ends_at: newEndsAt })
    .eq('id', eventId);

  revalidatePath(ROUTES.planner);
  revalidatePath(ROUTES.dashboard);
  return { error: error?.message ?? null };
}
