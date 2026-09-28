-- ============================================================================
-- FamilyHub — Family & Profiles Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql. Adds the real RLS policies and RPC
-- functions the Family + Profiles feature needs. Mutations that touch more
-- than one table (creating a family, inviting a member, changing a role)
-- go through SECURITY DEFINER functions so we get atomicity + clear error
-- messages instead of juggling multi-statement client-side transactions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER — safe to query family_members
-- directly inside them even though family_members itself has RLS enabled,
-- because these run with elevated privileges).
-- ----------------------------------------------------------------------------
create or replace function public.is_family_member(fid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = fid and fm.user_id = auth.uid()
  );
$$;

create or replace function public.is_family_admin(fid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = fid and fm.user_id = auth.uid() and fm.role in ('owner', 'admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- RLS policies — families
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their family" on public.families;
create policy "Members can view their family" on public.families
  for select using (public.is_family_member(id));

drop policy if exists "Owners can create a family" on public.families;
create policy "Owners can create a family" on public.families
  for insert with check (created_by = auth.uid());

drop policy if exists "Admins can update their family" on public.families;
create policy "Admins can update their family" on public.families
  for update using (public.is_family_admin(id));

-- ----------------------------------------------------------------------------
-- RLS policies — family_members
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their family's roster" on public.family_members;
create policy "Members can view their family's roster" on public.family_members
  for select using (public.is_family_member(family_id));

drop policy if exists "Admins can add members" on public.family_members;
create policy "Admins can add members" on public.family_members
  for insert with check (public.is_family_admin(family_id));

drop policy if exists "Admins can update member roles" on public.family_members;
create policy "Admins can update member roles" on public.family_members
  for update using (public.is_family_admin(family_id));

drop policy if exists "Admins can remove members" on public.family_members;
create policy "Admins can remove members" on public.family_members
  for delete using (public.is_family_admin(family_id));

-- ----------------------------------------------------------------------------
-- RLS policies — profiles
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view profiles in their family" on public.profiles;
create policy "Members can view profiles in their family" on public.profiles
  for select using (
    exists (
      select 1 from public.family_members fm
      where fm.id = profiles.family_member_id
        and public.is_family_member(fm.family_id)
    )
  );

drop policy if exists "Members can update their own profile" on public.profiles;
create policy "Members can update their own profile" on public.profiles
  for update using (
    exists (
      select 1 from public.family_members fm
      where fm.id = profiles.family_member_id
        and fm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RPC: create_family
-- Creates a family, makes the caller its owner, and seeds a blank profile
-- row for them — all in one atomic call.
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

  insert into public.families (name, description, created_by)
  values (trim(p_name), nullif(trim(coalesce(p_description, '')), ''), auth.uid())
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
-- RPC: add_family_member_by_email
-- Looks up an existing FamilyHub user by email and adds them to the
-- family. Returns a clear error if no account exists yet (rather than
-- silently inviting an email address we can't message).
-- ============================================================================
create or replace function public.add_family_member_by_email(
  p_family_id uuid,
  p_email text,
  p_role family_role default 'member'
)
returns public.family_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_member public.family_members;
begin
  if not public.is_family_admin(p_family_id) then
    raise exception 'Only family admins can add members' using errcode = '42501';
  end if;

  select id into v_user_id from public.users where lower(email) = lower(trim(p_email));

  if v_user_id is null then
    raise exception 'No FamilyHub account exists for that email yet. Ask them to sign up first, then add them.'
      using errcode = 'P0002';
  end if;

  if exists (select 1 from public.family_members where family_id = p_family_id and user_id = v_user_id) then
    raise exception 'That person is already a member of this family' using errcode = 'P0003';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (p_family_id, v_user_id, p_role)
  returning * into v_member;

  insert into public.profiles (family_member_id) values (v_member.id);

  return v_member;
end;
$$;

-- ============================================================================
-- RPC: update_family_member_role
-- Prevents demoting the last remaining owner of a family.
-- ============================================================================
create or replace function public.update_family_member_role(p_member_id uuid, p_role family_role)
returns public.family_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_current_role family_role;
  v_owner_count int;
  v_member public.family_members;
begin
  select family_id, role into v_family_id, v_current_role
  from public.family_members where id = p_member_id;

  if v_family_id is null then
    raise exception 'Member not found' using errcode = 'P0004';
  end if;

  if not public.is_family_admin(v_family_id) then
    raise exception 'Only family admins can change roles' using errcode = '42501';
  end if;

  if v_current_role = 'owner' and p_role != 'owner' then
    select count(*) into v_owner_count from public.family_members
    where family_id = v_family_id and role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'A family must always have at least one owner' using errcode = 'P0005';
    end if;
  end if;

  update public.family_members set role = p_role where id = p_member_id
  returning * into v_member;

  return v_member;
end;
$$;

-- ============================================================================
-- RPC: remove_family_member
-- Prevents removing the last remaining owner.
-- ============================================================================
create or replace function public.remove_family_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_role family_role;
  v_owner_count int;
begin
  select family_id, role into v_family_id, v_role
  from public.family_members where id = p_member_id;

  if v_family_id is null then
    raise exception 'Member not found' using errcode = 'P0004';
  end if;

  if not public.is_family_admin(v_family_id) then
    raise exception 'Only family admins can remove members' using errcode = '42501';
  end if;

  if v_role = 'owner' then
    select count(*) into v_owner_count from public.family_members
    where family_id = v_family_id and role = 'owner';

    if v_owner_count <= 1 then
      raise exception 'A family must always have at least one owner' using errcode = 'P0005';
    end if;
  end if;

  delete from public.family_members where id = p_member_id;
end;
$$;
