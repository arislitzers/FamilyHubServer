import { createClient } from '@/lib/supabase/server';
import type { ActivityEntry } from '@/types/activity.types';

/**
 * Cursor-paginated family activity feed, backed by the activity_log table
 * (see database/015_family_activity_feed.sql). Pass the `createdAt` of
 * the last entry you already have as `before` to fetch the next page —
 * this is what powers "Load more" in the Activity tab, and it's also what
 * the Dashboard's Family Activity card uses for its short preview (just
 * with a smaller limit and no pagination).
 */
export async function getFamilyActivityFeed(
  familyId: string,
  limit = 20,
  before?: string
): Promise<ActivityEntry[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any).rpc('get_family_activity_feed', {
    p_family_id: familyId,
    p_limit: limit,
    p_before: before ?? null,
  });

  if (error || !data) {
    if (error) console.error('getFamilyActivityFeed error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorAvatar: row.actor_avatar,
    actionType: row.action_type,
    objectType: row.object_type,
    objectId: row.object_id,
    summary: row.summary,
    createdAt: row.created_at,
  }));
}
