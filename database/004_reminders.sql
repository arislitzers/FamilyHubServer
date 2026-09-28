-- ============================================================================
-- FamilyHub — Reminders, Prayer Reminders & Check-Ins Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql, 002_family_and_profiles.sql, and
-- 003_planner.sql (relies on is_family_member / is_family_admin).
--
-- Note: `database/schema.sql` already added owner-only policies for
-- `reminders` ("Users can view/manage their own reminders"). This file
-- adds one more: family members may also view a reminder that its owner
-- chose to share (family_id is set), while only the owner can still
-- edit/complete/delete it.
-- ============================================================================

drop policy if exists "Members can view reminders shared with the family" on public.reminders;
create policy "Members can view reminders shared with the family" on public.reminders
  for select using (
    family_id is not null and public.is_family_member(family_id)
  );

-- ----------------------------------------------------------------------------
-- PRAYER_REMINDERS — personal only in this pass (family_id column exists
-- for a future family-wide prayer schedule, not exposed by the UI yet).
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their own prayer reminders" on public.prayer_reminders;
create policy "Users can view their own prayer reminders" on public.prayer_reminders
  for select using (auth.uid() = user_id);

drop policy if exists "Users can manage their own prayer reminders" on public.prayer_reminders;
create policy "Users can manage their own prayer reminders" on public.prayer_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- CHECK_INS — always family-scoped: any member can post and see the
-- family's check-in feed. A member can delete their own check-in; a
-- family admin can remove any (light moderation).
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their family's check-ins" on public.check_ins;
create policy "Members can view their family's check-ins" on public.check_ins
  for select using (public.is_family_member(family_id));

drop policy if exists "Members can post check-ins" on public.check_ins;
create policy "Members can post check-ins" on public.check_ins
  for insert with check (
    public.is_family_member(family_id) and user_id = auth.uid()
  );

drop policy if exists "Members can remove their own check-ins, admins any" on public.check_ins;
create policy "Members can remove their own check-ins, admins any" on public.check_ins
  for delete using (
    user_id = auth.uid() or public.is_family_admin(family_id)
  );
