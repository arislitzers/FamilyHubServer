import { createClient } from '@/lib/supabase/server';
import { getCategoryDefaultColor } from '@/types/planner.types';
import type { EventCategory, PlannerEvent } from '@/types/planner.types';

/**
 * Events for a family within [rangeStart, rangeEnd) (rangeEnd exclusive),
 * with recurring events already expanded into real occurrences and
 * privacy masking already applied — see get_family_planner_events in
 * database/011_planner_advanced.sql. This replaced a plain table select;
 * recurring events used to only ever show on their original creation
 * date, which is fixed now.
 */
export async function getPlannerEvents(
  familyId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<PlannerEvent[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any).rpc('get_family_planner_events', {
    p_family_id: familyId,
    p_range_start: rangeStart.toISOString(),
    p_range_end: rangeEnd.toISOString(),
  });

  if (error || !data) {
    if (error) console.error('getPlannerEvents error', error);
    return [];
  }

  return data.map((row: any) => {
    const category = (row.category ?? 'family') as EventCategory;
    return {
      id: row.id,
      occurrenceKey: `${row.id}_${row.occurrence_starts_at}`,
      familyId,
      createdBy: row.created_by,
      creatorName: row.creator_name ?? null,
      title: row.title,
      description: row.description,
      startsAt: row.occurrence_starts_at,
      endsAt: row.occurrence_ends_at,
      isRecurring: row.is_recurring,
      recurrenceRule: row.recurrence_rule,
      category,
      color: row.color || getCategoryDefaultColor(category),
      isFamilyVisible: row.is_family_visible,
      privacy: row.privacy,
      isMasked: row.is_masked,
    } satisfies PlannerEvent;
  });
}
