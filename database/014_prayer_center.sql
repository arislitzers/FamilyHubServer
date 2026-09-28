-- ============================================================================
-- FamilyHub — Prayer Center
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 013_private_groups.sql (relies on
-- is_family_member, is_family_admin, is_chat_participant, and
-- wants_notification).
--
-- Prayer Requests can be scoped to the whole family OR to a specific
-- private group (see 013_private_groups.sql) — "Prayer Groups" isn't a
-- new membership concept of its own, it's a private group chat used as a
-- visibility scope for prayer requests, the same way it's used to scope
-- who can read messages. That reuse is deliberate: one membership model,
-- fewer places for permissions to drift out of sync with each other.
-- ============================================================================

create table if not exists public.prayer_requests (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  created_by uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  visible_to_group_id uuid references public.chats (id) on delete set null,
  is_answered boolean not null default false,
  answered_at timestamptz,
  answer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.prayer_requests add constraint chk_prayer_requests_category
  check (category in ('health', 'family', 'guidance', 'thanksgiving', 'general', 'other'));
create index if not exists idx_prayer_requests_family on public.prayer_requests (family_id);
create trigger trg_prayer_requests_updated_at before update on public.prayer_requests
  for each row execute function set_updated_at();

create table if not exists public.prayer_request_prayers (
  id uuid primary key default uuid_generate_v4(),
  prayer_request_id uuid not null references public.prayer_requests (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prayer_request_id, user_id)
);
create index if not exists idx_prayer_prayers_request on public.prayer_request_prayers (prayer_request_id);

create table if not exists public.prayer_journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  family_id uuid references public.families (id) on delete cascade,
  title text,
  content text not null,
  entry_date date not null default current_date,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_prayer_journal_user on public.prayer_journal_entries (user_id);
create trigger trg_prayer_journal_updated_at before update on public.prayer_journal_entries
  for each row execute function set_updated_at();

alter table public.prayer_requests enable row level security;
alter table public.prayer_request_prayers enable row level security;
alter table public.prayer_journal_entries enable row level security;

-- ----------------------------------------------------------------------------
-- Helper: can the current user see a given prayer request — creator,
-- or (family-wide and a family member), or (group-scoped and a
-- participant of that group). SECURITY DEFINER so it can be used inside
-- RLS policies without those policies needing to re-derive the same logic.
-- ----------------------------------------------------------------------------
create or replace function public.can_view_prayer_request(p_request_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.prayer_requests pr
    where pr.id = p_request_id
      and (
        pr.created_by = auth.uid()
        or (pr.visible_to_group_id is null and public.is_family_member(pr.family_id))
        or (pr.visible_to_group_id is not null and public.is_chat_participant(pr.visible_to_group_id))
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- RLS — prayer_requests
-- ----------------------------------------------------------------------------
drop policy if exists "Visible prayer requests can be read" on public.prayer_requests;
create policy "Visible prayer requests can be read" on public.prayer_requests
  for select using (public.can_view_prayer_request(id));

drop policy if exists "Members can post prayer requests" on public.prayer_requests;
create policy "Members can post prayer requests" on public.prayer_requests
  for insert with check (
    created_by = auth.uid()
    and public.is_family_member(family_id)
    and (visible_to_group_id is null or public.is_chat_participant(visible_to_group_id))
  );

drop policy if exists "Creators and admins can update prayer requests" on public.prayer_requests;
create policy "Creators and admins can update prayer requests" on public.prayer_requests
  for update using (created_by = auth.uid() or public.is_family_admin(family_id));

drop policy if exists "Creators and admins can delete prayer requests" on public.prayer_requests;
create policy "Creators and admins can delete prayer requests" on public.prayer_requests
  for delete using (created_by = auth.uid() or public.is_family_admin(family_id));

-- ----------------------------------------------------------------------------
-- RLS — prayer_request_prayers ("I'm praying for this")
-- ----------------------------------------------------------------------------
drop policy if exists "Anyone who can see the request can see who's praying" on public.prayer_request_prayers;
create policy "Anyone who can see the request can see who's praying" on public.prayer_request_prayers
  for select using (public.can_view_prayer_request(prayer_request_id));

drop policy if exists "Anyone who can see the request can commit to pray" on public.prayer_request_prayers;
create policy "Anyone who can see the request can commit to pray" on public.prayer_request_prayers
  for insert with check (user_id = auth.uid() and public.can_view_prayer_request(prayer_request_id));

drop policy if exists "Users can remove their own prayer commitment" on public.prayer_request_prayers;
create policy "Users can remove their own prayer commitment" on public.prayer_request_prayers
  for delete using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- RLS — prayer_journal_entries (personal by default, optionally shared)
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their own journal entries" on public.prayer_journal_entries;
create policy "Users can view their own journal entries" on public.prayer_journal_entries
  for select using (user_id = auth.uid());

drop policy if exists "Members can view journal entries shared with the family" on public.prayer_journal_entries;
create policy "Members can view journal entries shared with the family" on public.prayer_journal_entries
  for select using (is_shared = true and family_id is not null and public.is_family_member(family_id));

drop policy if exists "Users can manage their own journal entries" on public.prayer_journal_entries;
create policy "Users can manage their own journal entries" on public.prayer_journal_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Prayer reminders can now be shared with the family, same pattern as
-- Reminders — schema.sql already has the family_id column, it just had
-- no policy allowing anyone but the owner to see a shared one.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view prayer reminders shared with the family" on public.prayer_reminders;
create policy "Members can view prayer reminders shared with the family" on public.prayer_reminders
  for select using (family_id is not null and public.is_family_member(family_id));

-- ============================================================================
-- RPC: get_prayer_requests
-- ============================================================================
create or replace function public.get_prayer_requests(p_family_id uuid, p_answered boolean default false)
returns table (
  id uuid,
  family_id uuid,
  created_by uuid,
  author_name text,
  author_avatar text,
  title text,
  description text,
  category text,
  visible_to_group_id uuid,
  group_name text,
  is_answered boolean,
  answered_at timestamptz,
  answer_note text,
  pray_count int,
  i_am_praying boolean,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    pr.id, pr.family_id, pr.created_by, u.full_name, u.avatar_url,
    pr.title, pr.description, pr.category, pr.visible_to_group_id, g.name,
    pr.is_answered, pr.answered_at, pr.answer_note,
    (select count(*)::int from public.prayer_request_prayers p where p.prayer_request_id = pr.id),
    exists (select 1 from public.prayer_request_prayers p2 where p2.prayer_request_id = pr.id and p2.user_id = auth.uid()),
    pr.created_at
  from public.prayer_requests pr
  join public.users u on u.id = pr.created_by
  left join public.chats g on g.id = pr.visible_to_group_id
  where pr.family_id = p_family_id
    and pr.is_answered = p_answered
    and public.can_view_prayer_request(pr.id)
  order by pr.created_at desc;
$$;

-- ============================================================================
-- RPC: toggle_pray_for_request — commit to pray / un-commit.
-- ============================================================================
create or replace function public.toggle_pray_for_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now_praying boolean;
begin
  if not public.can_view_prayer_request(p_request_id) then
    raise exception 'Not visible to you' using errcode = '42501';
  end if;

  if exists (select 1 from public.prayer_request_prayers where prayer_request_id = p_request_id and user_id = auth.uid()) then
    delete from public.prayer_request_prayers where prayer_request_id = p_request_id and user_id = auth.uid();
    v_now_praying := false;
  else
    insert into public.prayer_request_prayers (prayer_request_id, user_id) values (p_request_id, auth.uid());
    v_now_praying := true;
  end if;

  return v_now_praying;
end;
$$;

-- ============================================================================
-- RPC: mark_prayer_answered / unmark_prayer_answered
-- ============================================================================
create or replace function public.mark_prayer_answered(p_request_id uuid, p_answer_note text default null)
returns public.prayer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.prayer_requests;
begin
  select * into v_request from public.prayer_requests where id = p_request_id;

  if v_request.id is null then
    raise exception 'Prayer request not found' using errcode = 'P0004';
  end if;

  if v_request.created_by != auth.uid() and not public.is_family_admin(v_request.family_id) then
    raise exception 'Only the requester or a family admin can mark this answered' using errcode = '42501';
  end if;

  update public.prayer_requests
  set is_answered = true, answered_at = now(), answer_note = p_answer_note
  where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

create or replace function public.unmark_prayer_answered(p_request_id uuid)
returns public.prayer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.prayer_requests;
begin
  select * into v_request from public.prayer_requests where id = p_request_id;

  if v_request.id is null then
    raise exception 'Prayer request not found' using errcode = 'P0004';
  end if;

  if v_request.created_by != auth.uid() and not public.is_family_admin(v_request.family_id) then
    raise exception 'Only the requester or a family admin can undo this' using errcode = '42501';
  end if;

  update public.prayer_requests
  set is_answered = false, answered_at = null, answer_note = null
  where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

-- ============================================================================
-- TRIGGER: notify_new_prayer_request / notify_prayer_answered
-- ============================================================================
create or replace function public.notify_new_prayer_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_name text;
  v_recipient record;
begin
  select coalesce(full_name, email) into v_author_name from public.users where id = new.created_by;

  for v_recipient in
    select fm.user_id from public.family_members fm
    where fm.family_id = new.family_id
      and fm.user_id != new.created_by
      and (
        new.visible_to_group_id is null
        or exists (select 1 from public.chat_participants cp where cp.chat_id = new.visible_to_group_id and cp.user_id = fm.user_id)
      )
      and public.wants_notification(fm.user_id, 'prayer_request')
  loop
    insert into public.notifications (user_id, family_id, type, title, body)
    values (
      v_recipient.user_id,
      new.family_id,
      'prayer_request',
      coalesce(v_author_name, 'Someone') || ' shared a prayer request',
      new.title
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_prayer_request on public.prayer_requests;
create trigger trg_notify_new_prayer_request
  after insert on public.prayer_requests
  for each row execute function public.notify_new_prayer_request();

create or replace function public.notify_prayer_answered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient record;
begin
  if new.is_answered = true and old.is_answered = false then
    for v_recipient in
      select distinct p.user_id from public.prayer_request_prayers p
      where p.prayer_request_id = new.id and p.user_id != new.created_by
    loop
      if public.wants_notification(v_recipient.user_id, 'prayer_answered') then
        insert into public.notifications (user_id, family_id, type, title, body)
        values (
          v_recipient.user_id,
          new.family_id,
          'prayer_answered',
          'Prayer answered: ' || new.title,
          new.answer_note
        );
      end if;
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_prayer_answered on public.prayer_requests;
create trigger trg_notify_prayer_answered
  after update of is_answered on public.prayer_requests
  for each row execute function public.notify_prayer_answered();
