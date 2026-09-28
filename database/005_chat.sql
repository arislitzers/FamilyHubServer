-- ============================================================================
-- FamilyHub — Chat Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql, 002_family_and_profiles.sql,
-- 003_planner.sql, and 004_reminders.sql (relies on is_family_member).
--
-- Model: every direct message is between two members of the same family
-- (FamilyHub has no cross-family messaging), plus one auto-provisioned
-- "family" chat everyone in the family shares. Message send/receive is
-- driven straight from the browser client via Supabase Realtime — RLS
-- below is what actually enforces access, not the UI.
-- ============================================================================

create or replace function public.is_chat_participant(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = cid and cp.user_id = auth.uid()
  );
$$;

-- Add `messages` to Supabase's Realtime publication so postgres_changes
-- subscriptions (used by MessageThread on the client) actually fire.
-- Safe to re-run — does nothing if already added.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- RLS — chats / chat_participants / messages
-- ----------------------------------------------------------------------------
drop policy if exists "Participants can view their chats" on public.chats;
create policy "Participants can view their chats" on public.chats
  for select using (public.is_chat_participant(id));

drop policy if exists "Participants can view chat rosters" on public.chat_participants;
create policy "Participants can view chat rosters" on public.chat_participants
  for select using (public.is_chat_participant(chat_id));

drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages" on public.messages
  for select using (public.is_chat_participant(chat_id));

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages" on public.messages
  for insert with check (
    public.is_chat_participant(chat_id) and sender_id = auth.uid()
  );

drop policy if exists "Senders can edit their own messages" on public.messages;
create policy "Senders can edit their own messages" on public.messages
  for update using (sender_id = auth.uid());

-- ============================================================================
-- RPC: get_or_create_family_chat
-- Ensures the family's single shared "family" chat exists and that the
-- caller is a participant, creating either as needed. Idempotent.
-- ============================================================================
create or replace function public.get_or_create_family_chat(p_family_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
  v_family_name text;
begin
  if not public.is_family_member(p_family_id) then
    raise exception 'Not a member of this family' using errcode = '42501';
  end if;

  select * into v_chat from public.chats
  where family_id = p_family_id and type = 'family'
  limit 1;

  if v_chat.id is null then
    select name into v_family_name from public.families where id = p_family_id;

    insert into public.chats (family_id, type, name, created_by)
    values (p_family_id, 'family', coalesce(v_family_name, 'Family') || ' chat', auth.uid())
    returning * into v_chat;

    insert into public.chat_participants (chat_id, user_id)
    select v_chat.id, fm.user_id from public.family_members fm
    where fm.family_id = p_family_id
    on conflict (chat_id, user_id) do nothing;
  else
    insert into public.chat_participants (chat_id, user_id)
    values (v_chat.id, auth.uid())
    on conflict (chat_id, user_id) do nothing;
  end if;

  return v_chat;
end;
$$;

-- ============================================================================
-- RPC: get_or_create_direct_chat
-- Finds (or creates) the 1:1 chat between the caller and p_other_user_id.
-- Requires both users to share at least one family.
-- ============================================================================
create or replace function public.get_or_create_direct_chat(p_other_user_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
  v_shared_family boolean;
begin
  if p_other_user_id = auth.uid() then
    raise exception 'Cannot start a direct chat with yourself' using errcode = 'P0006';
  end if;

  select exists (
    select 1 from public.family_members a
    join public.family_members b on a.family_id = b.family_id
    where a.user_id = auth.uid() and b.user_id = p_other_user_id
  ) into v_shared_family;

  if not v_shared_family then
    raise exception 'You can only message people in your family' using errcode = '42501';
  end if;

  select c.* into v_chat
  from public.chats c
  where c.type = 'direct'
    and exists (select 1 from public.chat_participants cp where cp.chat_id = c.id and cp.user_id = auth.uid())
    and exists (select 1 from public.chat_participants cp where cp.chat_id = c.id and cp.user_id = p_other_user_id)
    and (select count(*) from public.chat_participants cp where cp.chat_id = c.id) = 2
  limit 1;

  if v_chat.id is null then
    insert into public.chats (type, created_by)
    values ('direct', auth.uid())
    returning * into v_chat;

    insert into public.chat_participants (chat_id, user_id)
    values (v_chat.id, auth.uid()), (v_chat.id, p_other_user_id);
  end if;

  return v_chat;
end;
$$;

-- ============================================================================
-- RPC: get_my_chat_threads
-- One-shot thread list for the current user: chat metadata, the other
-- participant's identity for direct chats, and a last-message preview —
-- everything the Chat sidebar needs without N+1 queries from the client.
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
  last_message_at timestamptz
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
    lm.created_at as last_message_at
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
  order by coalesce(lm.created_at, c.created_at) desc;
$$;
