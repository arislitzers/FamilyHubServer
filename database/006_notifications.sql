-- ============================================================================
-- FamilyHub — Notifications Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 005_chat.sql (relies on
-- is_family_member and the tables those files touch).
--
-- `database/schema.sql` already added a `select` policy for notifications
-- ("Users can view their own notifications"). This file adds update/delete
-- policies, then wires up SECURITY DEFINER triggers so notifications are
-- generated automatically by the events that should produce them — a new
-- message, being added to a family, a role change, a new planner event —
-- rather than the app having to remember to insert one from every code path.
-- ============================================================================

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- Add `notifications` to the Realtime publication so the bell badge and
-- feed update live without a refresh. Safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ============================================================================
-- TRIGGER: notify_new_message
-- Fires after a message is inserted; notifies every other participant in
-- that chat. SECURITY DEFINER so it can write notifications for users
-- other than the sender, bypassing their own RLS.
-- ============================================================================
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_name text;
  v_chat_type chat_type;
  v_family_id uuid;
  v_preview text;
begin
  select coalesce(full_name, email) into v_sender_name from public.users where id = new.sender_id;
  select type, family_id into v_chat_type, v_family_id from public.chats where id = new.chat_id;
  v_preview := left(coalesce(new.content, ''), 80);

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    cp.user_id,
    v_family_id,
    'message',
    coalesce(v_sender_name, 'Someone') || ' sent a message',
    v_preview
  from public.chat_participants cp
  where cp.chat_id = new.chat_id and cp.user_id != new.sender_id;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ============================================================================
-- TRIGGER: notify_family_member_added
-- Fires when someone new joins a family (skips the owner row created
-- alongside the family itself — that's not really an "invite").
-- ============================================================================
create or replace function public.notify_family_member_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_name text;
begin
  if new.role != 'owner' then
    select name into v_family_name from public.families where id = new.family_id;

    insert into public.notifications (user_id, family_id, type, title, body)
    values (
      new.user_id,
      new.family_id,
      'family_member_added',
      'You joined ' || coalesce(v_family_name, 'a family'),
      'Welcome! You can see everyone''s profiles, plans, and reminders now.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_family_member_added on public.family_members;
create trigger trg_notify_family_member_added
  after insert on public.family_members
  for each row execute function public.notify_family_member_added();

-- ============================================================================
-- TRIGGER: notify_role_changed
-- Fires when a member's role changes (e.g. promoted to admin).
-- ============================================================================
create or replace function public.notify_role_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_name text;
begin
  if new.role != old.role then
    select name into v_family_name from public.families where id = new.family_id;

    insert into public.notifications (user_id, family_id, type, title, body)
    values (
      new.user_id,
      new.family_id,
      'role_changed',
      'Your role changed in ' || coalesce(v_family_name, 'your family'),
      'You are now ' || new.role || '.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_role_changed on public.family_members;
create trigger trg_notify_role_changed
  after update of role on public.family_members
  for each row execute function public.notify_role_changed();

-- ============================================================================
-- TRIGGER: notify_new_planner_event
-- Fires when a family member adds a planner event; notifies the rest of
-- the family (not the creator).
-- ============================================================================
create or replace function public.notify_new_planner_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_name text;
begin
  select coalesce(full_name, email) into v_creator_name from public.users where id = new.created_by;

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    fm.user_id,
    new.family_id,
    'planner_event',
    'New event: ' || new.title,
    coalesce(v_creator_name, 'Someone') || ' added this to the family planner'
  from public.family_members fm
  where fm.family_id = new.family_id and fm.user_id != new.created_by;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_planner_event on public.planner_events;
create trigger trg_notify_new_planner_event
  after insert on public.planner_events
  for each row execute function public.notify_new_planner_event();
