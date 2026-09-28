-- ============================================================================
-- FamilyHub — Private Groups
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 012_notifications_advanced.sql.
--
-- A "private group" reuses the chat infrastructure that already existed
-- (chats.type = 'group' was defined back in the original schema but never
-- built) rather than introducing a parallel membership model: creating a
-- group IS creating a group chat with a specific set of family members as
-- its participants. "Private" means exactly what it does for direct
-- messages — is_chat_participant() already ensures only members of a
-- chat can see it exists at all, including in get_my_chat_threads(). A
-- family owner/admin gets no automatic visibility into a group they
-- weren't added to; that's the point of "private."
-- ============================================================================

alter table public.chat_participants add column if not exists role text not null default 'member';
alter table public.chat_participants add constraint chk_chat_participants_role
  check (role in ('admin', 'member'));

-- ----------------------------------------------------------------------------
-- RLS — admins of a group chat can manage its participant list (add,
-- remove, promote). Regular members can still remove themselves (leave)
-- via the same policy, since user_id = auth.uid() covers that case too.
-- ----------------------------------------------------------------------------
drop policy if exists "Group admins manage participants, members manage themselves" on public.chat_participants;
create policy "Group admins manage participants, members manage themselves" on public.chat_participants
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_participants me
      where me.chat_id = chat_participants.chat_id and me.user_id = auth.uid() and me.role = 'admin'
    )
  );

drop policy if exists "Group admins can update participant roles" on public.chat_participants;
create policy "Group admins can update participant roles" on public.chat_participants
  for update using (
    exists (
      select 1 from public.chat_participants me
      where me.chat_id = chat_participants.chat_id and me.user_id = auth.uid() and me.role = 'admin'
    )
  );

drop policy if exists "Group admins can add participants" on public.chat_participants;
create policy "Group admins can add participants" on public.chat_participants
  for insert with check (
    -- Either you're an existing admin of the chat adding someone else...
    exists (
      select 1 from public.chat_participants me
      where me.chat_id = chat_participants.chat_id and me.user_id = auth.uid() and me.role = 'admin'
    )
    -- ...or this is the very first participant row for a brand-new chat
    -- you just created (create_group_chat / get_or_create_* handle this).
    or chat_participants.user_id = auth.uid()
  );

-- Admins (not just any member) can rename or delete a group they belong to.
drop policy if exists "Group admins can rename their group" on public.chats;
create policy "Group admins can rename their group" on public.chats
  for update using (
    exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chats.id and cp.user_id = auth.uid() and cp.role = 'admin'
    )
  );

drop policy if exists "Group admins can delete their group" on public.chats;
create policy "Group admins can delete their group" on public.chats
  for delete using (
    type = 'group'
    and exists (
      select 1 from public.chat_participants cp
      where cp.chat_id = chats.id and cp.user_id = auth.uid() and cp.role = 'admin'
    )
  );

-- ============================================================================
-- RPC: create_group_chat
-- ============================================================================
create or replace function public.create_group_chat(
  p_family_id uuid,
  p_name text,
  p_member_user_ids uuid[]
)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
  v_member_id uuid;
begin
  if not public.is_family_member(p_family_id) then
    raise exception 'Not a member of this family' using errcode = '42501';
  end if;

  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Group name is required' using errcode = 'P0001';
  end if;

  insert into public.chats (family_id, type, name, created_by)
  values (p_family_id, 'group', trim(p_name), auth.uid())
  returning * into v_chat;

  insert into public.chat_participants (chat_id, user_id, role)
  values (v_chat.id, auth.uid(), 'admin');

  foreach v_member_id in array coalesce(p_member_user_ids, array[]::uuid[])
  loop
    if v_member_id != auth.uid() and public.is_family_member_user(p_family_id, v_member_id) then
      insert into public.chat_participants (chat_id, user_id, role)
      values (v_chat.id, v_member_id, 'member')
      on conflict (chat_id, user_id) do nothing;
    end if;
  end loop;

  return v_chat;
end;
$$;

-- Helper: is a *specific* user (not necessarily the caller) a member of
-- a family — needed to validate the member list passed into
-- create_group_chat/add_group_member without trusting the client.
create or replace function public.is_family_member_user(p_family_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = p_family_id and fm.user_id = p_user_id
  );
$$;

-- ============================================================================
-- RPC: add_group_member / remove_group_member / promote_group_member /
-- leave_group_chat / rename_group_chat / delete_group_chat
-- ============================================================================
create or replace function public.add_group_member(p_chat_id uuid, p_user_id uuid)
returns public.chat_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_is_admin boolean;
  v_participant public.chat_participants;
begin
  select family_id into v_family_id from public.chats where id = p_chat_id and type = 'group';
  if v_family_id is null then
    raise exception 'Group not found' using errcode = 'P0004';
  end if;

  select exists (
    select 1 from public.chat_participants where chat_id = p_chat_id and user_id = auth.uid() and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Only group admins can add members' using errcode = '42501';
  end if;

  if not public.is_family_member_user(v_family_id, p_user_id) then
    raise exception 'That person is not in this family' using errcode = 'P0014';
  end if;

  insert into public.chat_participants (chat_id, user_id, role)
  values (p_chat_id, p_user_id, 'member')
  on conflict (chat_id, user_id) do nothing
  returning * into v_participant;

  return v_participant;
end;
$$;

create or replace function public.remove_group_member(p_chat_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_target_role text;
  v_admin_count int;
begin
  select exists (
    select 1 from public.chat_participants where chat_id = p_chat_id and user_id = auth.uid() and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Only group admins can remove members' using errcode = '42501';
  end if;

  select role into v_target_role from public.chat_participants
  where chat_id = p_chat_id and user_id = p_user_id;

  if v_target_role = 'admin' then
    select count(*) into v_admin_count from public.chat_participants
    where chat_id = p_chat_id and role = 'admin';

    if v_admin_count <= 1 then
      raise exception 'A group must always have at least one admin' using errcode = 'P0005';
    end if;
  end if;

  delete from public.chat_participants where chat_id = p_chat_id and user_id = p_user_id;
end;
$$;

create or replace function public.promote_group_member(p_chat_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  select exists (
    select 1 from public.chat_participants where chat_id = p_chat_id and user_id = auth.uid() and role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Only group admins can promote members' using errcode = '42501';
  end if;

  update public.chat_participants set role = 'admin' where chat_id = p_chat_id and user_id = p_user_id;
end;
$$;

create or replace function public.leave_group_chat(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_admin_count int;
begin
  select role into v_role from public.chat_participants
  where chat_id = p_chat_id and user_id = auth.uid();

  if v_role is null then
    raise exception 'You are not in this group' using errcode = 'P0004';
  end if;

  if v_role = 'admin' then
    select count(*) into v_admin_count from public.chat_participants
    where chat_id = p_chat_id and role = 'admin';

    if v_admin_count <= 1 then
      raise exception 'You''re the only admin. Promote someone else first, or delete the group instead.'
        using errcode = 'P0005';
    end if;
  end if;

  delete from public.chat_participants where chat_id = p_chat_id and user_id = auth.uid();
end;
$$;

create or replace function public.rename_group_chat(p_chat_id uuid, p_name text)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
begin
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Group name is required' using errcode = 'P0001';
  end if;

  update public.chats set name = trim(p_name)
  where id = p_chat_id and type = 'group'
  returning * into v_chat;

  if v_chat.id is null then
    raise exception 'Group not found, or you are not an admin' using errcode = 'P0004';
  end if;

  return v_chat;
end;
$$;

create or replace function public.delete_group_chat(p_chat_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.chats where id = p_chat_id and type = 'group';
$$;

-- ============================================================================
-- RPC: get_group_members — member list + roles for the group management UI.
-- ============================================================================
create or replace function public.get_group_members(p_chat_id uuid)
returns table (user_id uuid, full_name text, email text, avatar_url text, role text)
language sql
security definer
stable
set search_path = public
as $$
  select u.id, u.full_name, u.email, u.avatar_url, cp.role
  from public.chat_participants cp
  join public.users u on u.id = cp.user_id
  where cp.chat_id = p_chat_id
    and public.is_chat_participant(p_chat_id)
  order by cp.role desc, u.full_name asc;
$$;

-- ============================================================================
-- get_my_chat_threads (redefined from 005_chat.sql) — adds member_count
-- and the caller's own role in each chat, so the UI can tell group chats
-- apart from direct/family threads and know whether "Manage group"
-- controls should be admin-level.
-- ============================================================================
create or replace function public.get_my_chat_threads()
returns table (
  chat_id uuid,
  type chat_type,
  family_id uuid,
  chat_name text,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  last_message text,
  last_message_at timestamptz,
  member_count int,
  my_role text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.id as chat_id,
    c.type,
    c.family_id,
    c.name as chat_name,
    ou.id as other_user_id,
    ou.full_name as other_user_name,
    ou.avatar_url as other_user_avatar,
    lm.content as last_message,
    lm.created_at as last_message_at,
    mc.member_count,
    me.role as my_role
  from public.chats c
  join public.chat_participants me on me.chat_id = c.id and me.user_id = auth.uid()
  left join lateral (
    select cp.user_id from public.chat_participants cp
    where cp.chat_id = c.id and cp.user_id != auth.uid()
    limit 1
  ) other_participant on c.type = 'direct'
  left join public.users ou on ou.id = other_participant.user_id
  left join lateral (
    select m.content, m.created_at from public.messages m
    where m.chat_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*) as member_count from public.chat_participants cp2 where cp2.chat_id = c.id
  ) mc on true
  order by coalesce(lm.created_at, c.created_at) desc;
$$;
