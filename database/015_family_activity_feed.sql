-- ============================================================================
-- FamilyHub — Family Activity Feed
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 014_prayer_center.sql.
--
-- The Dashboard's "Family activity" card previously assembled its feed by
-- querying planner_events, check_ins, and family_members directly at read
-- time — fine for a 3-source preview, but it doesn't scale to "think
-- Facebook timeline": more action types, pagination, and per-entry
-- privacy scoping (a personal planner event or a group-scoped prayer
-- request must never appear in a feed the whole family can read). This
-- migration replaces that with a real activity_log table, written by
-- triggers at the moment each action happens, with the same
-- family-wide-vs-group-scoped visibility model already used by Prayer
-- Requests.
--
-- Known simplification: entries are denormalized (the human-readable
-- `summary` and object title are captured at write time) and are NOT
-- automatically removed or updated if the underlying object is later
-- edited or deleted — much like a real social timeline, an entry can
-- outlive the thing it describes. object_id has no foreign key for this
-- reason (it can point to different tables depending on object_type).
-- ============================================================================

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  actor_id uuid not null references public.users (id) on delete cascade,
  action_type text not null,
  object_type text not null,
  object_id uuid,
  summary text not null,
  visible_to_group_id uuid references public.chats (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_log_family_created on public.activity_log (family_id, created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "Visible activity can be read" on public.activity_log;
create policy "Visible activity can be read" on public.activity_log
  for select using (
    (visible_to_group_id is null and public.is_family_member(family_id))
    or (visible_to_group_id is not null and public.is_chat_participant(visible_to_group_id))
  );
-- No insert/update/delete policies for regular users — only the
-- SECURITY DEFINER triggers below ever write to this table.

-- ----------------------------------------------------------------------------
-- Shared helper so every trigger below is a one-liner instead of
-- repeating the same insert statement ten times.
-- ----------------------------------------------------------------------------
create or replace function public.log_activity(
  p_family_id uuid,
  p_actor_id uuid,
  p_action_type text,
  p_object_type text,
  p_object_id uuid,
  p_summary text,
  p_visible_to_group_id uuid default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.activity_log (family_id, actor_id, action_type, object_type, object_id, summary, visible_to_group_id)
  values (p_family_id, p_actor_id, p_action_type, p_object_type, p_object_id, p_summary, p_visible_to_group_id);
$$;

-- ============================================================================
-- Planner events — created and (meaningfully) updated. Personal
-- (non-family-visible) events are never logged, matching their existing
-- privacy rule.
-- ============================================================================
create or replace function public.log_planner_event_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_family_visible then
    perform public.log_activity(
      new.family_id, new.created_by, 'planner_event_created', 'planner_event', new.id,
      'added "' || new.title || '" to the planner'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_planner_event_created on public.planner_events;
create trigger trg_log_planner_event_created
  after insert on public.planner_events
  for each row execute function public.log_planner_event_created();

create or replace function public.log_planner_event_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_family_visible and (old.title != new.title or old.starts_at != new.starts_at) then
    perform public.log_activity(
      new.family_id, new.created_by, 'planner_event_updated', 'planner_event', new.id,
      'updated the planner event "' || new.title || '"'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_planner_event_updated on public.planner_events;
create trigger trg_log_planner_event_updated
  after update on public.planner_events
  for each row execute function public.log_planner_event_updated();

-- ============================================================================
-- Reminders — only ones explicitly shared with the family are logged;
-- purely personal reminders stay invisible, same as everywhere else.
-- ============================================================================
create or replace function public.log_reminder_shared()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.family_id is not null then
    perform public.log_activity(
      new.family_id, new.user_id, 'reminder_shared', 'reminder', new.id,
      'shared a reminder: "' || new.title || '"'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_reminder_shared on public.reminders;
create trigger trg_log_reminder_shared
  after insert on public.reminders
  for each row execute function public.log_reminder_shared();

create or replace function public.log_reminder_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.family_id is not null and new.is_completed = true and old.is_completed = false then
    perform public.log_activity(
      new.family_id, new.user_id, 'reminder_completed', 'reminder', new.id,
      'completed "' || new.title || '"'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_reminder_completed on public.reminders;
create trigger trg_log_reminder_completed
  after update of is_completed on public.reminders
  for each row execute function public.log_reminder_completed();

-- ============================================================================
-- Prayer requests — created and answered, respecting the request's own
-- group-scoping (a group-only prayer request only appears in that
-- group's activity, never the whole family's).
-- ============================================================================
create or replace function public.log_prayer_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(
    new.family_id, new.created_by, 'prayer_request_created', 'prayer_request', new.id,
    'created a prayer request: "' || new.title || '"',
    new.visible_to_group_id
  );
  return new;
end;
$$;

drop trigger if exists trg_log_prayer_request_created on public.prayer_requests;
create trigger trg_log_prayer_request_created
  after insert on public.prayer_requests
  for each row execute function public.log_prayer_request_created();

create or replace function public.log_prayer_answered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_answered = true and old.is_answered = false then
    perform public.log_activity(
      new.family_id, new.created_by, 'prayer_answered', 'prayer_request', new.id,
      'saw a prayer answered: "' || new.title || '"',
      new.visible_to_group_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_prayer_answered on public.prayer_requests;
create trigger trg_log_prayer_answered
  after update of is_answered on public.prayer_requests
  for each row execute function public.log_prayer_answered();

-- ============================================================================
-- Family membership — joining and role changes (skips the owner row
-- created alongside the family itself, same as the notification trigger).
-- ============================================================================
create or replace function public.log_member_joined()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role != 'owner' then
    perform public.log_activity(
      new.family_id, new.user_id, 'member_joined', 'family_member', new.id,
      'joined the family'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_member_joined on public.family_members;
create trigger trg_log_member_joined
  after insert on public.family_members
  for each row execute function public.log_member_joined();

create or replace function public.log_role_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role != old.role then
    perform public.log_activity(
      new.family_id, new.user_id, 'role_changed', 'family_member', new.id,
      'became ' || new.role
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_role_changed on public.family_members;
create trigger trg_log_role_changed
  after update of role on public.family_members
  for each row execute function public.log_role_changed();

-- ============================================================================
-- Check-ins and media
-- ============================================================================
create or replace function public.log_check_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(
    new.family_id, new.user_id, 'check_in_posted', 'check_in', new.id,
    'checked in: ' || new.status
  );
  return new;
end;
$$;

drop trigger if exists trg_log_check_in on public.check_ins;
create trigger trg_log_check_in
  after insert on public.check_ins
  for each row execute function public.log_check_in();

create or replace function public.log_media_uploaded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.family_id is not null then
    perform public.log_activity(
      new.family_id, new.uploaded_by, 'media_uploaded', 'media', new.id,
      'added a photo or file: "' || new.file_name || '"'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_media_uploaded on public.media;
create trigger trg_log_media_uploaded
  after insert on public.media
  for each row execute function public.log_media_uploaded();

-- ============================================================================
-- RPC: get_family_activity_feed
-- Cursor-paginated (via p_before) so the feed can support "load more"
-- without ever refetching the same page twice.
-- ============================================================================
create or replace function public.get_family_activity_feed(
  p_family_id uuid,
  p_limit int default 20,
  p_before timestamptz default null
)
returns table (
  id uuid,
  actor_id uuid,
  actor_name text,
  actor_avatar text,
  action_type text,
  object_type text,
  object_id uuid,
  summary text,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    al.id, al.actor_id, coalesce(u.full_name, u.email), u.avatar_url,
    al.action_type, al.object_type, al.object_id, al.summary, al.created_at
  from public.activity_log al
  join public.users u on u.id = al.actor_id
  where al.family_id = p_family_id
    and (p_before is null or al.created_at < p_before)
    and (
      (al.visible_to_group_id is null and public.is_family_member(p_family_id))
      or (al.visible_to_group_id is not null and public.is_chat_participant(al.visible_to_group_id))
    )
  order by al.created_at desc
  limit p_limit;
$$;
