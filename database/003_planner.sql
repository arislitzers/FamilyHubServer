-- ============================================================================
-- FamilyHub — Planner Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql and database/002_family_and_profiles.sql
-- (this file relies on the is_family_member / is_family_admin helper
-- functions defined there).
--
-- Access model: any family member can see and add events (it's a shared
-- planner). Editing or deleting an event is restricted to whoever created
-- it, or a family admin/owner — so one member can't silently rewrite
-- another's plans.
-- ============================================================================

drop policy if exists "Members can view their family's planner" on public.planner_events;
create policy "Members can view their family's planner" on public.planner_events
  for select using (public.is_family_member(family_id));

drop policy if exists "Members can add planner events" on public.planner_events;
create policy "Members can add planner events" on public.planner_events
  for insert with check (
    public.is_family_member(family_id) and created_by = auth.uid()
  );

drop policy if exists "Creators and admins can update events" on public.planner_events;
create policy "Creators and admins can update events" on public.planner_events
  for update using (
    created_by = auth.uid() or public.is_family_admin(family_id)
  );

drop policy if exists "Creators and admins can delete events" on public.planner_events;
create policy "Creators and admins can delete events" on public.planner_events
  for delete using (
    created_by = auth.uid() or public.is_family_admin(family_id)
  );
