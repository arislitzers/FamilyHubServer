-- ============================================================================
-- FamilyHub — Advanced User Profiles
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 009_family_management_advanced.sql.
--
-- Extends `profiles` with the remaining fields from the profile spec —
-- nickname, relationship (Father/Mother/Sibling/etc.), phone, a contact
-- email distinct from the account's login email, and per-field privacy.
--
-- Privacy model: RLS can't hide individual *columns* on a row everyone can
-- otherwise read, so field-level privacy is enforced in a SECURITY DEFINER
-- RPC (get_family_profiles) instead of raw table RLS — it nulls out any
-- field the owner marked 'private' unless the viewer is the owner
-- themselves or a family admin. The base `profiles` table RLS (self can
-- update own row, family can view own row) still applies for direct
-- reads/writes; the app should read through this RPC for anything that
-- displays other people's profiles.
-- ============================================================================

alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists relationship text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists contact_email text;
alter table public.profiles add column if not exists privacy_settings jsonb not null default
  '{"phone": "family", "birthday": "family", "contact_email": "family"}'::jsonb;

-- ============================================================================
-- RPC: get_family_profiles
-- Privacy-aware profile fetch for an entire family. Returns null for any
-- field its owner set to 'private', unless the caller is that owner or a
-- family admin (admins can always see everything, matching the rest of
-- FamilyHub's permission model — see the Permissions reference card).
-- ============================================================================
create or replace function public.get_family_profiles(p_family_id uuid)
returns table (
  family_member_id uuid,
  user_id uuid,
  role family_role,
  joined_at timestamptz,
  full_name text,
  account_email text,
  avatar_url text,
  display_name text,
  nickname text,
  relationship text,
  bio text,
  color_tag text,
  birthday date,
  phone text,
  contact_email text,
  privacy_settings jsonb,
  is_self boolean
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  if not public.is_family_member(p_family_id) then
    raise exception 'Not a member of this family' using errcode = '42501';
  end if;

  v_is_admin := public.is_family_admin(p_family_id);

  return query
  select
    fm.id,
    fm.user_id,
    fm.role,
    fm.joined_at,
    u.full_name,
    u.email,
    u.avatar_url,
    p.display_name,
    p.nickname,
    p.relationship,
    p.bio,
    p.color_tag,
    case when v_is_admin or fm.user_id = auth.uid() or coalesce(p.privacy_settings ->> 'birthday', 'family') = 'family'
      then p.birthday else null end,
    case when v_is_admin or fm.user_id = auth.uid() or coalesce(p.privacy_settings ->> 'phone', 'family') = 'family'
      then p.phone else null end,
    case when v_is_admin or fm.user_id = auth.uid() or coalesce(p.privacy_settings ->> 'contact_email', 'family') = 'family'
      then p.contact_email else null end,
    p.privacy_settings,
    fm.user_id = auth.uid()
  from public.family_members fm
  join public.users u on u.id = fm.user_id
  left join public.profiles p on p.family_member_id = fm.id
  where fm.family_id = p_family_id
  order by fm.joined_at asc;
end;
$$;
