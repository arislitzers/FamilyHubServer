-- ============================================================================
-- FamilyHub — Advanced Notification Center
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 011_planner_advanced.sql.
--
-- The Notification Center itself (badge, history, mark-as-read, delete)
-- was already real — this file is about making "Notification categories"
-- mean something by generating a few more kinds of notification that were
-- previously silent: a check-in posted, a reminder shared with the
-- family, someone requesting to join by code, and a new family photo/file.
-- All four respect the same wants_notification() preference check (see
-- database/007_settings.sql) as the original four types, defaulting to on
-- for anyone who hasn't explicitly turned them off.
-- ============================================================================

-- ============================================================================
-- TRIGGER: notify_new_check_in
-- ============================================================================
create or replace function public.notify_new_check_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_poster_name text;
begin
  select coalesce(full_name, email) into v_poster_name from public.users where id = new.user_id;

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    fm.user_id,
    new.family_id,
    'check_in',
    coalesce(v_poster_name, 'Someone') || ' checked in',
    new.status || case when new.note is not null then ' — ' || new.note else '' end
  from public.family_members fm
  where fm.family_id = new.family_id
    and fm.user_id != new.user_id
    and public.wants_notification(fm.user_id, 'check_in');

  return new;
end;
$$;

drop trigger if exists trg_notify_new_check_in on public.check_ins;
create trigger trg_notify_new_check_in
  after insert on public.check_ins
  for each row execute function public.notify_new_check_in();

-- ============================================================================
-- TRIGGER: notify_shared_reminder
-- Only fires when the reminder was explicitly shared with the family
-- (family_id is set) — purely personal reminders stay silent to everyone
-- but their owner, same as always.
-- ============================================================================
create or replace function public.notify_shared_reminder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_name text;
begin
  if new.family_id is null then
    return new;
  end if;

  select coalesce(full_name, email) into v_owner_name from public.users where id = new.user_id;

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    fm.user_id,
    new.family_id,
    'reminder_shared',
    coalesce(v_owner_name, 'Someone') || ' shared a reminder',
    new.title
  from public.family_members fm
  where fm.family_id = new.family_id
    and fm.user_id != new.user_id
    and public.wants_notification(fm.user_id, 'reminder_shared');

  return new;
end;
$$;

drop trigger if exists trg_notify_shared_reminder on public.reminders;
create trigger trg_notify_shared_reminder
  after insert on public.reminders
  for each row execute function public.notify_shared_reminder();

-- ============================================================================
-- TRIGGER: notify_join_request
-- Notifies family admins/owners when someone requests to join by code —
-- otherwise the only way to learn about a pending request was to happen
-- to open the Family Settings tab.
-- ============================================================================
create or replace function public.notify_join_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester_name text;
begin
  select coalesce(full_name, email) into v_requester_name from public.users where id = new.user_id;

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    fm.user_id,
    new.family_id,
    'join_request',
    coalesce(v_requester_name, 'Someone') || ' wants to join',
    'They used your family code — review it from Family → Settings.'
  from public.family_members fm
  where fm.family_id = new.family_id
    and fm.role in ('owner', 'admin')
    and public.wants_notification(fm.user_id, 'join_request');

  return new;
end;
$$;

drop trigger if exists trg_notify_join_request on public.family_join_requests;
create trigger trg_notify_join_request
  after insert on public.family_join_requests
  for each row execute function public.notify_join_request();

-- ============================================================================
-- TRIGGER: notify_media_uploaded
-- ============================================================================
create or replace function public.notify_media_uploaded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uploader_name text;
begin
  if new.family_id is null then
    return new;
  end if;

  select coalesce(full_name, email) into v_uploader_name from public.users where id = new.uploaded_by;

  insert into public.notifications (user_id, family_id, type, title, body)
  select
    fm.user_id,
    new.family_id,
    'media_uploaded',
    coalesce(v_uploader_name, 'Someone') || ' added a photo or file',
    new.file_name
  from public.family_members fm
  where fm.family_id = new.family_id
    and fm.user_id != new.uploaded_by
    and public.wants_notification(fm.user_id, 'media_uploaded');

  return new;
end;
$$;

drop trigger if exists trg_notify_media_uploaded on public.media;
create trigger trg_notify_media_uploaded
  after insert on public.media
  for each row execute function public.notify_media_uploaded();
