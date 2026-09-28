-- ============================================================================
-- FamilyHub — Advanced Family Management
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 008_media.sql (relies on
-- is_family_member / is_family_admin, and redefines create_family from
-- 002_family_and_profiles.sql to also generate a family code).
--
-- Adds:
--   - A short, shareable `family_code` per family (join by code, with
--     admin approval — see family_join_requests below).
--   - Invite links (join instantly, no approval — an admin explicitly
--     generated and shared the link, so it's pre-approved by design).
--   - Leave family / delete family.
--
-- Known simplification carried over from earlier modules: a user still
-- belongs to at most one family. Joining a second family (by code or
-- link) while already in one is blocked with a clear error rather than
-- silently creating a multi-family state the rest of the app doesn't
-- expect yet.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- families.family_code — short, unique, human-shareable (e.g. "7F3K9QRT")
-- ----------------------------------------------------------------------------
alter table public.families add column if not exists family_code text unique;

create or replace function public.generate_family_code()
returns text
language plpgsql
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I to avoid confusion
  v_code text;
  v_exists boolean;
begin
  loop
    v_code := '';
    for i in 1..8 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    end loop;

    select exists (select 1 from public.families where family_code = v_code) into v_exists;
    exit when not v_exists;
  end loop;

  return v_code;
end;
$$;

-- Backfill existing families created before this migration.
update public.families set family_code = public.generate_family_code() where family_code is null;

alter table public.families alter column family_code set not null;

-- ----------------------------------------------------------------------------
-- FAMILY_JOIN_REQUESTS — "join by code" always requires admin approval.
-- ----------------------------------------------------------------------------
create type join_request_status as enum ('pending', 'approved', 'denied');

create table if not exists public.family_join_requests (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  status join_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_join_requests_family on public.family_join_requests (family_id);
create index if not exists idx_join_requests_user on public.family_join_requests (user_id);
create trigger trg_join_requests_updated_at before update on public.family_join_requests
  for each row execute function set_updated_at();

alter table public.family_join_requests enable row level security;

drop policy if exists "Users can view their own join requests" on public.family_join_requests;
create policy "Users can view their own join requests" on public.family_join_requests
  for select using (user_id = auth.uid());

drop policy if exists "Admins can view join requests for their family" on public.family_join_requests;
create policy "Admins can view join requests for their family" on public.family_join_requests
  for select using (public.is_family_admin(family_id));

drop policy if exists "Admins can resolve join requests" on public.family_join_requests;
create policy "Admins can resolve join requests" on public.family_join_requests
  for update using (public.is_family_admin(family_id));

-- ----------------------------------------------------------------------------
-- FAMILY_INVITE_LINKS — join instantly via a shared token, no approval.
-- ----------------------------------------------------------------------------
create table if not exists public.family_invite_links (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  token text not null unique,
  role family_role not null default 'member',
  created_by uuid not null references public.users (id) on delete cascade,
  max_uses int,
  use_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_invite_links_family on public.family_invite_links (family_id);
create index if not exists idx_invite_links_token on public.family_invite_links (token);

alter table public.family_invite_links enable row level security;

drop policy if exists "Admins can view their family's invite links" on public.family_invite_links;
create policy "Admins can view their family's invite links" on public.family_invite_links
  for select using (public.is_family_admin(family_id));

drop policy if exists "Admins can revoke invite links" on public.family_invite_links;
create policy "Admins can revoke invite links" on public.family_invite_links
  for update using (public.is_family_admin(family_id));

-- ============================================================================
-- RPC: create_family (redefined) — now also generates a family_code.
-- ============================================================================
create or replace function public.create_family(p_name text, p_description text default null)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family public.families;
  v_member_id uuid;
begin
  if trim(p_name) = '' then
    raise exception 'Family name is required' using errcode = 'P0001';
  end if;

  insert into public.families (name, description, created_by, family_code)
  values (trim(p_name), nullif(trim(coalesce(p_description, '')), ''), auth.uid(), public.generate_family_code())
  returning * into v_family;

  insert into public.family_members (family_id, user_id, role)
  values (v_family.id, auth.uid(), 'owner')
  returning id into v_member_id;

  insert into public.profiles (family_member_id)
  values (v_member_id);

  return v_family;
end;
$$;

-- ============================================================================
-- RPC: regenerate_family_code — admin-only, e.g. if the old code leaked.
-- ============================================================================
create or replace function public.regenerate_family_code(p_family_id uuid)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family public.families;
begin
  if not public.is_family_admin(p_family_id) then
    raise exception 'Only family admins can regenerate the family code' using errcode = '42501';
  end if;

  update public.families
  set family_code = public.generate_family_code()
  where id = p_family_id
  returning * into v_family;

  return v_family;
end;
$$;

-- ============================================================================
-- RPC: get_my_family_status
-- One-shot check for the "no family yet" screen: are you already in a
-- family, do you have a pending join request, and if so which family.
-- ============================================================================
create or replace function public.get_my_pending_join_request()
returns table (request_id uuid, family_name text, requested_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select jr.id, f.name, jr.requested_at
  from public.family_join_requests jr
  join public.families f on f.id = jr.family_id
  where jr.user_id = auth.uid() and jr.status = 'pending'
  limit 1;
$$;

-- ============================================================================
-- RPC: request_to_join_family
-- Looks up a family by its code and files a pending join request.
-- ============================================================================
create or replace function public.request_to_join_family(p_family_code text)
returns public.family_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_request public.family_join_requests;
begin
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'You''re already in a family. Leave your current family first if you''d like to join a different one.'
      using errcode = 'P0007';
  end if;

  if exists (select 1 from public.family_join_requests where user_id = auth.uid() and status = 'pending') then
    raise exception 'You already have a pending request to join a family' using errcode = 'P0008';
  end if;

  select id into v_family_id from public.families where family_code = upper(trim(p_family_code));

  if v_family_id is null then
    raise exception 'No family found with that code — double check it and try again' using errcode = 'P0009';
  end if;

  insert into public.family_join_requests (family_id, user_id)
  values (v_family_id, auth.uid())
  returning * into v_request;

  return v_request;
end;
$$;

-- ============================================================================
-- RPC: get_family_join_requests — admin fetch of pending requests.
-- ============================================================================
create or replace function public.get_family_join_requests(p_family_id uuid)
returns table (
  request_id uuid,
  user_id uuid,
  full_name text,
  email text,
  avatar_url text,
  requested_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select jr.id, u.id, u.full_name, u.email, u.avatar_url, jr.requested_at
  from public.family_join_requests jr
  join public.users u on u.id = jr.user_id
  where jr.family_id = p_family_id and jr.status = 'pending'
    and public.is_family_admin(p_family_id)
  order by jr.requested_at asc;
$$;

-- ============================================================================
-- RPC: approve_join_request / deny_join_request
-- ============================================================================
create or replace function public.approve_join_request(p_request_id uuid)
returns public.family_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.family_join_requests;
  v_member public.family_members;
begin
  select * into v_request from public.family_join_requests where id = p_request_id;

  if v_request.id is null then
    raise exception 'Request not found' using errcode = 'P0004';
  end if;

  if not public.is_family_admin(v_request.family_id) then
    raise exception 'Only family admins can approve join requests' using errcode = '42501';
  end if;

  if v_request.status != 'pending' then
    raise exception 'This request has already been resolved' using errcode = 'P0010';
  end if;

  if exists (select 1 from public.family_members where user_id = v_request.user_id) then
    update public.family_join_requests
    set status = 'denied', resolved_at = now(), resolved_by = auth.uid()
    where id = p_request_id;
    raise exception 'That person has since joined another family; request auto-denied' using errcode = 'P0011';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (v_request.family_id, v_request.user_id, 'member')
  returning * into v_member;

  insert into public.profiles (family_member_id) values (v_member.id);

  update public.family_join_requests
  set status = 'approved', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id;

  return v_member;
end;
$$;

create or replace function public.deny_join_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select family_id into v_family_id from public.family_join_requests where id = p_request_id;

  if v_family_id is null then
    raise exception 'Request not found' using errcode = 'P0004';
  end if;

  if not public.is_family_admin(v_family_id) then
    raise exception 'Only family admins can deny join requests' using errcode = '42501';
  end if;

  update public.family_join_requests
  set status = 'denied', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id and status = 'pending';
end;
$$;

-- ============================================================================
-- RPC: create_invite_link / revoke_invite_link / get_family_invite_links
-- ============================================================================
create or replace function public.create_invite_link(
  p_family_id uuid,
  p_role family_role default 'member',
  p_max_uses int default null,
  p_expires_in_hours int default null
)
returns public.family_invite_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.family_invite_links;
  v_token text;
begin
  if not public.is_family_admin(p_family_id) then
    raise exception 'Only family admins can create invite links' using errcode = '42501';
  end if;

  if p_role = 'owner' then
    raise exception 'Invite links cannot grant owner access' using errcode = 'P0012';
  end if;

  v_token := encode(gen_random_bytes(16), 'hex');

  insert into public.family_invite_links (family_id, token, role, created_by, max_uses, expires_at)
  values (
    p_family_id,
    v_token,
    p_role,
    auth.uid(),
    p_max_uses,
    case when p_expires_in_hours is null then null else now() + (p_expires_in_hours || ' hours')::interval end
  )
  returning * into v_link;

  return v_link;
end;
$$;

create or replace function public.revoke_invite_link(p_link_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  select family_id into v_family_id from public.family_invite_links where id = p_link_id;

  if not public.is_family_admin(v_family_id) then
    raise exception 'Only family admins can revoke invite links' using errcode = '42501';
  end if;

  update public.family_invite_links set is_active = false where id = p_link_id;
end;
$$;

create or replace function public.get_family_invite_links(p_family_id uuid)
returns setof public.family_invite_links
language sql
security definer
stable
set search_path = public
as $$
  select * from public.family_invite_links
  where family_id = p_family_id
    and public.is_family_admin(p_family_id)
  order by created_at desc;
$$;

-- ============================================================================
-- RPC: get_invite_link_preview — resolve a token to a family name without
-- requiring the caller to already be a member (used by the /join/[token]
-- landing page before they've accepted).
-- ============================================================================
create or replace function public.get_invite_link_preview(p_token text)
returns table (family_name text, is_valid boolean, reason text)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_link public.family_invite_links;
  v_family_name text;
begin
  select * into v_link from public.family_invite_links where token = p_token;

  if v_link.id is null then
    return query select null::text, false, 'This invite link is invalid.';
    return;
  end if;

  select name into v_family_name from public.families where id = v_link.family_id;

  if not v_link.is_active then
    return query select v_family_name, false, 'This invite link has been turned off.';
  elsif v_link.expires_at is not null and v_link.expires_at < now() then
    return query select v_family_name, false, 'This invite link has expired.';
  elsif v_link.max_uses is not null and v_link.use_count >= v_link.max_uses then
    return query select v_family_name, false, 'This invite link has reached its use limit.';
  else
    return query select v_family_name, true, null::text;
  end if;
end;
$$;

-- ============================================================================
-- RPC: join_family_via_invite — instant join, no approval needed.
-- ============================================================================
create or replace function public.join_family_via_invite(p_token text)
returns public.family_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.family_invite_links;
  v_member public.family_members;
begin
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'You''re already in a family. Leave your current family first if you''d like to join a different one.'
      using errcode = 'P0007';
  end if;

  select * into v_link from public.family_invite_links where token = p_token for update;

  if v_link.id is null then
    raise exception 'This invite link is invalid' using errcode = 'P0013';
  end if;
  if not v_link.is_active then
    raise exception 'This invite link has been turned off' using errcode = 'P0013';
  end if;
  if v_link.expires_at is not null and v_link.expires_at < now() then
    raise exception 'This invite link has expired' using errcode = 'P0013';
  end if;
  if v_link.max_uses is not null and v_link.use_count >= v_link.max_uses then
    raise exception 'This invite link has reached its use limit' using errcode = 'P0013';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (v_link.family_id, auth.uid(), v_link.role)
  returning * into v_member;

  insert into public.profiles (family_member_id) values (v_member.id);

  update public.family_invite_links set use_count = use_count + 1 where id = v_link.id;

  return v_member;
end;
$$;

-- ============================================================================
-- RPC: leave_family — a member removes themselves. Blocked for a sole owner.
-- ============================================================================
create or replace function public.leave_family()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_family_id uuid;
  v_role family_role;
  v_owner_count int;
begin
  select id, family_id, role into v_member_id, v_family_id, v_role
  from public.family_members where user_id = auth.uid();

  if v_member_id is null then
    raise exception 'You are not in a family' using errcode = 'P0004';
  end if;

  if v_role = 'owner' then
    select count(*) into v_owner_count from public.family_members
    where family_id = v_family_id and role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'You''re the only owner. Promote someone else to owner first, or delete the family instead.'
        using errcode = 'P0005';
    end if;
  end if;

  delete from public.family_members where id = v_member_id;
end;
$$;

-- ============================================================================
-- RPC: delete_family — owner-only, permanently deletes the family and
-- everything scoped to it (cascades through every family_id foreign key).
-- ============================================================================
create or replace function public.delete_family(p_family_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role family_role;
begin
  select role into v_role from public.family_members
  where family_id = p_family_id and user_id = auth.uid();

  if v_role is null or v_role != 'owner' then
    raise exception 'Only the family owner can delete the family' using errcode = '42501';
  end if;

  delete from public.families where id = p_family_id;
end;
$$;
