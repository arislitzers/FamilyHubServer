'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';
import type { NotificationPreferences } from '@/types/settings.types';

interface ActionResult {
  error: string | null;
}

export async function updateLanguageAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const language = String(formData.get('language') ?? 'en');

  const { error } = await (supabase as any)
    .from('settings')
    .update({ language })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.settings);
  return { error: null };
}

export async function updateNotificationPreferenceAction(
  key: keyof NotificationPreferences,
  value: boolean
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const { data: current } = await (supabase as any)
    .from('settings')
    .select('notification_preferences')
    .eq('user_id', user.id)
    .maybeSingle();

  const nextPreferences = {
    ...(current?.notification_preferences as Record<string, boolean> | undefined),
    [key]: value,
  };

  const { error } = await (supabase as any)
    .from('settings')
    .update({ notification_preferences: nextPreferences })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.settings);
  return { error: null };
}

/**
 * Write-through record of the theme mode + color package to the
 * settings table. localStorage remains the actual source of truth for
 * hydration on this device (see contexts/theme-context.tsx) — this just
 * means the preference is visible server-side and is a starting point
 * for real cross-device sync later.
 */
export async function updateThemePreferenceAction(theme: string, colorTheme: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const { error } = await (supabase as any)
    .from('settings')
    .update({ theme, color_theme: colorTheme })
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Security — password change
// ----------------------------------------------------------------------------
export async function updatePasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirmPassword) return { error: "Passwords don't match." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { error: null };
}

// ----------------------------------------------------------------------------
// Privacy — export my data
// ----------------------------------------------------------------------------
export async function exportMyDataAction(): Promise<{ error: string | null; data?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const [profile, settings, reminders, prayerRequests, journalEntries, checkIns] = await Promise.all([
    (supabase as any).from('users').select('*').eq('id', user.id).maybeSingle(),
    (supabase as any).from('settings').select('*').eq('user_id', user.id).maybeSingle(),
    (supabase as any).from('reminders').select('*').eq('user_id', user.id),
    (supabase as any).from('prayer_requests').select('*').eq('created_by', user.id),
    (supabase as any).from('prayer_journal_entries').select('*').eq('user_id', user.id),
    (supabase as any).from('check_ins').select('*').eq('user_id', user.id),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile.data ?? null,
    settings: settings.data ?? null,
    reminders: reminders.data ?? [],
    prayerRequestsCreated: prayerRequests.data ?? [],
    prayerJournalEntries: journalEntries.data ?? [],
    checkIns: checkIns.data ?? [],
  };

  return { error: null, data: JSON.stringify(exportPayload, null, 2) };
}
