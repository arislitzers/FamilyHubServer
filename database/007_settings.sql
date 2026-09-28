-- ============================================================================
-- FamilyHub — Settings Module (+ an important fix)
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 006_notifications.sql.
--
-- THE FIX: every earlier migration assumed a `public.users` row exists for
-- each signed-up person (family_members.user_id, reminders.user_id, etc.
-- all reference public.users). Nothing was ever creating that row —
-- Supabase Auth only populates auth.users. Without this trigger, calling
-- create_family() (or anything else that inserts a row referencing
-- public.users) would fail with a foreign-key violation the moment a real
-- person signed up. This file adds the standard Supabase pattern: a
-- trigger on auth.users that provisions both `public.users` and a default
-- `public.settings` row the instant someone signs up, plus a one-time
-- backfill for any accounts that already slipped through.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.settings (user_id, theme, notification_preferences, language)
  values (
    new.id,
    'system',
    '{"message": true, "family_member_added": true, "role_changed": true, "planner_event": true}'::jsonb,
    'en'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-time backfill for any accounts created before this trigger existed.
insert into public.users (id, email, full_name, avatar_url)
select u.id, u.email, u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

insert into public.settings (user_id, theme, notification_preferences, language)
select u.id, 'system', '{"message": true, "family_member_added": true, "role_changed": true, "planner_event": true}'::jsonb, 'en'
from auth.users u
on conflict (user_id) do nothing;

-- ============================================================================
-- Make the notification triggers respect per-type preferences.
-- Redefines the same four functions from 006_notifications.sql — same
-- trigger bindings, so no re-creation of the triggers themselves is
-- needed, just CREATE OR REPLACE on the function bodies.
-- ============================================================================
create or replace function public.wants_notification(p_user_id uuid, p_type text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select (notification_preferences ->> p_type)::boolean from public.settings where user_id = p_user_id),
    true -- no settings row or no explicit preference yet -> default to on
  );
$$;

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
  where cp.chat_id = new.chat_id
    and cp.user_id != new.sender_id
    and public.wants_notification(cp.user_id, 'message');

  return new;
end;
$$;

create or replace function public.notify_family_member_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_name text;
begin
  if new.role != 'owner' and public.wants_notification(new.user_id, 'family_member_added') then
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

create or replace function public.notify_role_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_name text;
begin
  if new.role != old.role and public.wants_notification(new.user_id, 'role_changed') then
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
  where fm.family_id = new.family_id
    and fm.user_id != new.created_by
    and public.wants_notification(fm.user_id, 'planner_event');

  return new;
end;
$$;
