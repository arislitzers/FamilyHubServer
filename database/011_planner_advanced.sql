-- ============================================================================
-- FamilyHub — Advanced Weekly Planner
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 010_user_profiles_advanced.sql.
--
-- Adds:
--   - category + color (color defaults from category but can be overridden
--     per event)
--   - is_family_visible: OFF means a purely personal event that never
--     appears to anyone but its creator — not even as a "Busy" block.
--   - privacy ('public' | 'private'): only matters when is_family_visible
--     is true. 'private' still shows the time slot to the rest of the
--     family (so they know you're busy) but masks the title/description
--     to "Busy" for everyone except the creator and family admins.
--   - Real recurrence expansion: daily/weekly/monthly events now actually
--     materialize into occurrences across a requested date range, via
--     get_family_planner_events, instead of only ever showing on their
--     original creation date (the known simplification from the original
--     Planner module).
--
-- Field-level privacy (masking title/description) can't be done with row
-- RLS alone — same reasoning as get_family_profiles in
-- 010_user_profiles_advanced.sql — so it's enforced inside this new
-- SECURITY DEFINER RPC instead. The base table RLS is tightened so a
-- non-family-visible event's row is only ever visible to its creator,
-- full stop.
-- ============================================================================

alter table public.planner_events add column if not exists category text not null default 'family';
alter table public.planner_events add constraint chk_planner_events_category
  check (category in ('family', 'work', 'school', 'health', 'birthday', 'holiday', 'personal', 'other'));

alter table public.planner_events add column if not exists color text;

alter table public.planner_events add column if not exists is_family_visible boolean not null default true;

alter table public.planner_events add column if not exists privacy text not null default 'public';
alter table public.planner_events add constraint chk_planner_events_privacy
  check (privacy in ('public', 'private'));

-- ----------------------------------------------------------------------------
-- Tighten the base RLS: a personal (not family-visible) event's row is
-- only ever visible to its creator, regardless of family membership.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their family's planner" on public.planner_events;
create policy "Members can view their family's planner" on public.planner_events
  for select using (
    created_by = auth.uid()
    or (is_family_visible = true and public.is_family_member(family_id))
  );

-- ============================================================================
-- RPC: get_family_planner_events
-- Expands recurring events into real occurrences across [range_start,
-- range_end), applies the is_family_visible / privacy rules, and masks
-- title/description to "Busy" for 'private' events when the viewer isn't
-- the creator or a family admin.
-- ============================================================================
create or replace function public.get_family_planner_events(
  p_family_id uuid,
  p_range_start timestamptz,
  p_range_end timestamptz
)
returns table (
  id uuid,
  occurrence_starts_at timestamptz,
  occurrence_ends_at timestamptz,
  created_by uuid,
  creator_name text,
  title text,
  description text,
  is_recurring boolean,
  recurrence_rule text,
  category text,
  color text,
  is_family_visible boolean,
  privacy text,
  is_masked boolean
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_event record;
  v_duration interval;
  v_occurrence timestamptz;
  v_month_start timestamptz;
begin
  if not public.is_family_member(p_family_id) then
    raise exception 'Not a member of this family' using errcode = '42501';
  end if;

  v_is_admin := public.is_family_admin(p_family_id);

  for v_event in
    select pe.*, coalesce(u.full_name, u.email) as creator_full_name
    from public.planner_events pe
    join public.users u on u.id = pe.created_by
    where pe.family_id = p_family_id
      and (pe.created_by = auth.uid() or pe.is_family_visible = true)
  loop
    v_duration := coalesce(v_event.ends_at - v_event.starts_at, interval '0');

    if not v_event.is_recurring or v_event.recurrence_rule is null then
      -- One-off event: include only if it falls in the requested range.
      if v_event.starts_at >= p_range_start and v_event.starts_at < p_range_end then
        id := v_event.id;
        occurrence_starts_at := v_event.starts_at;
        occurrence_ends_at := v_event.ends_at;
        creator_name := v_event.creator_full_name;
        is_recurring := v_event.is_recurring;
        recurrence_rule := v_event.recurrence_rule;
        category := v_event.category;
        color := v_event.color;
        is_family_visible := v_event.is_family_visible;
        privacy := v_event.privacy;
        created_by := v_event.created_by;

        if v_event.privacy = 'private' and v_event.created_by != auth.uid() and not v_is_admin then
          title := 'Busy';
          description := null;
          is_masked := true;
        else
          title := v_event.title;
          description := v_event.description;
          is_masked := false;
        end if;

        return next;
      end if;
    else
      -- Recurring event: walk forward from its original start, emitting
      -- one row per occurrence that falls inside the requested range.
      v_occurrence := v_event.starts_at;

      -- Fast-forward daily/weekly occurrences close to the range start
      -- instead of iterating from the very first occurrence every time.
      if v_event.recurrence_rule = 'daily' and v_occurrence < p_range_start then
        v_occurrence := v_occurrence +
          (floor(extract(epoch from (p_range_start - v_occurrence)) / 86400) * interval '1 day');
      elsif v_event.recurrence_rule = 'weekly' and v_occurrence < p_range_start then
        v_occurrence := v_occurrence +
          (floor(extract(epoch from (p_range_start - v_occurrence)) / (86400 * 7)) * interval '7 days');
      end if;

      while v_occurrence < p_range_end loop
        if v_occurrence >= p_range_start and v_occurrence >= v_event.starts_at then
          id := v_event.id;
          occurrence_starts_at := v_occurrence;
          occurrence_ends_at := case when v_event.ends_at is not null then v_occurrence + v_duration else null end;
          creator_name := v_event.creator_full_name;
          is_recurring := v_event.is_recurring;
          recurrence_rule := v_event.recurrence_rule;
          category := v_event.category;
          color := v_event.color;
          is_family_visible := v_event.is_family_visible;
          privacy := v_event.privacy;
          created_by := v_event.created_by;

          if v_event.privacy = 'private' and v_event.created_by != auth.uid() and not v_is_admin then
            title := 'Busy';
            description := null;
            is_masked := true;
          else
            title := v_event.title;
            description := v_event.description;
            is_masked := false;
          end if;

          return next;
        end if;

        if v_event.recurrence_rule = 'daily' then
          v_occurrence := v_occurrence + interval '1 day';
        elsif v_event.recurrence_rule = 'weekly' then
          v_occurrence := v_occurrence + interval '7 days';
        elsif v_event.recurrence_rule = 'monthly' then
          v_occurrence := v_occurrence + interval '1 month';
        else
          exit; -- unknown recurrence rule, stop expanding
        end if;
      end loop;
    end if;
  end loop;

  return;
end;
$$;
