import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * Deleting an auth.users row requires the service-role key — the
 * regular session-scoped client can never do this, by design. This
 * route verifies the caller's own session first (so nobody can delete
 * someone else's account), blocks the delete if it would leave a family
 * without an owner (same rule leave_family() already enforces), and only
 * then uses the admin client to actually remove the account.
 *
 * Deleting the auth.users row cascades through `public.users` to every
 * table that references it — family_members, reminders, prayer_journal_
 * entries, messages sent, notifications, settings, and more (see the
 * `on delete cascade` foreign keys throughout database/schema.sql and
 * later migrations). That includes messages the person sent in any
 * chat — there's no "soft delete"/anonymization step here, which is a
 * real, deliberate tradeoff: it's simpler and more honestly "your data
 * is gone" than a half-anonymized row lingering in someone else's chat
 * history, but it does mean conversations lose those messages entirely.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }

  const { data: soleOwnerRows } = await supabase
    .from('family_members')
    .select('family_id, role, families(name)')
    .eq('user_id', user.id)
    .eq('role', 'owner');

  for (const row of soleOwnerRows ?? []) {
    const { count } = await supabase
      .from('family_members')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', (row as any).family_id)
      .eq('role', 'owner');

    if ((count ?? 0) <= 1) {
      const familyName = (row as any).families?.name ?? 'a family';
      return NextResponse.json(
        {
          error: `You're the only owner of ${familyName}. Promote someone else to owner first, or delete that family, before deleting your account.`,
        },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
