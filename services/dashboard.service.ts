import { createClient } from '@/lib/supabase/server';

export interface UnreadMessagesSummary {
  count: number;
  latestTitle: string | null;
  latestPreview: string | null;
  latestAt: string | null;
}

/**
 * Reads from `notifications` (type = 'message') rather than the messages
 * table itself — FamilyHub doesn't track per-message read receipts, and
 * the notification a chat message already generates (see
 * database/006_notifications.sql) is a perfectly good proxy for "unread".
 */
export async function getUnreadMessagesSummary(userId: string): Promise<UnreadMessagesSummary> {
  const supabase = createClient();

  const { count } = await (supabase as any)
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'message')
    .eq('is_read', false);

  const { data: latest } = await (supabase as any)
    .from('notifications')
    .select('title, body, created_at')
    .eq('user_id', userId)
    .eq('type', 'message')
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    count: count ?? 0,
    latestTitle: latest?.title ?? null,
    latestPreview: latest?.body ?? null,
    latestAt: latest?.created_at ?? null,
  };
}

// Note: the family activity feed used to be assembled here from three
// separate ad-hoc queries (planner_events, check_ins, family_members).
// It's now backed by a real activity_log table with many more action
// types and proper pagination — see services/activity.service.ts and
// database/015_family_activity_feed.sql. The Dashboard's preview card
// and the full Activity tab on the Family page both call
// getFamilyActivityFeed() from that file now, so there's one
// implementation instead of two.
