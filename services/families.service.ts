import { createClient } from '@/lib/supabase/server';
import type {
  FamilyMemberWithProfile,
  FamilyRole,
  FamilySummary,
  PendingJoinRequest,
  FamilyJoinRequest,
  FamilyInviteLink,
  FamilyProfileDetail,
} from '@/types/family.types';

/**
 * Returns the signed-in user's family (assumes single-family membership
 * for this iteration — the schema supports more, and a family switcher
 * can be layered on top later without changing this shape).
 */
export async function getMyFamily(): Promise<{
  family: FamilySummary | null;
  myRole: FamilyRole | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { family: null, myRole: null };

  // Cast to `any` for this embedded-resource select: our hand-written
  // Database type (types/database.types.ts) doesn't encode foreign-key
  // Relationships, which supabase-js needs to type joins like
  // `families(...)` precisely. Runtime shape is validated by the manual
  // mapping below instead. Swap this for the real generated types
  // (see the note at the top of database.types.ts) to get full safety.
  const { data, error } = await (supabase as any)
    .from('family_members')
    .select('role, families(id, name, description, cover_image_url, created_by, family_code)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.families) {
    if (error) console.error('getMyFamily error', error);
    return { family: null, myRole: null };
  }

  const family = data.families as unknown as {
    id: string;
    name: string;
    description: string | null;
    cover_image_url: string | null;
    created_by: string;
    family_code: string;
  };

  return {
    family: {
      id: family.id,
      name: family.name,
      description: family.description,
      coverImageUrl: family.cover_image_url,
      createdBy: family.created_by,
      familyCode: family.family_code,
    },
    myRole: data.role as FamilyRole,
  };
}

/** Full member roster for a family, joined with user + profile data. */
export async function getFamilyMembers(familyId: string): Promise<FamilyMemberWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('family_members')
    .select(
      `id, user_id, role, joined_at,
       users ( email, full_name, avatar_url ),
       profiles ( id, display_name, birthday, bio, color_tag )`
    )
    .eq('family_id', familyId)
    .order('joined_at', { ascending: true });

  if (error || !data) {
    if (error) console.error('getFamilyMembers error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    email: row.users?.email ?? '',
    fullName: row.users?.full_name ?? null,
    avatarUrl: row.users?.avatar_url ?? null,
    profile: row.profiles
      ? {
          id: row.profiles.id,
          displayName: row.profiles.display_name,
          birthday: row.profiles.birthday,
          bio: row.profiles.bio,
          colorTag: row.profiles.color_tag,
        }
      : null,
  }));
}

/** Checks whether the current user has a pending "join by code" request. */
export async function getMyPendingJoinRequest(): Promise<PendingJoinRequest | null> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_my_pending_join_request');

  if (error || !data || data.length === 0) {
    if (error) console.error('getMyPendingJoinRequest error', error);
    return null;
  }

  const row = data[0];
  return {
    requestId: row.request_id,
    familyName: row.family_name,
    requestedAt: row.requested_at,
  };
}

/**
 * Privacy-aware profile fetch for the /profiles page. Unlike
 * getFamilyMembers() (used by the roster/chat/planner, which only needs
 * name/avatar/role), this goes through get_family_profiles so fields an
 * owner marked 'private' come back null for anyone but themselves or an
 * admin — see database/010_user_profiles_advanced.sql.
 */
export async function getFamilyProfiles(familyId: string): Promise<FamilyProfileDetail[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_family_profiles', {
    p_family_id: familyId,
  });

  if (error || !data) {
    if (error) console.error('getFamilyProfiles error', error);
    return [];
  }

  return data.map((row: any) => ({
    familyMemberId: row.family_member_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    fullName: row.full_name,
    accountEmail: row.account_email,
    avatarUrl: row.avatar_url,
    displayName: row.display_name,
    nickname: row.nickname,
    relationship: row.relationship,
    bio: row.bio,
    colorTag: row.color_tag,
    birthday: row.birthday,
    phone: row.phone,
    contactEmail: row.contact_email,
    privacySettings: {
      phone: row.privacy_settings?.phone ?? 'family',
      birthday: row.privacy_settings?.birthday ?? 'family',
      contact_email: row.privacy_settings?.contact_email ?? 'family',
    },
    isSelf: row.is_self,
  }));
}

/** Admin-only: pending join requests waiting on a decision. */
export async function getFamilyJoinRequests(familyId: string): Promise<FamilyJoinRequest[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_family_join_requests', {
    p_family_id: familyId,
  });

  if (error || !data) {
    if (error) console.error('getFamilyJoinRequests error', error);
    return [];
  }

  return data.map((row: any) => ({
    requestId: row.request_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    requestedAt: row.requested_at,
  }));
}

/**
 * Resolves an invite token to a family name + validity, without requiring
 * the caller to already be a family member — used by the public
 * /join/[token] landing page before someone has accepted.
 */
export async function getInviteLinkPreview(
  token: string
): Promise<{ familyName: string | null; isValid: boolean; reason: string | null }> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_invite_link_preview', { p_token: token });

  if (error || !data || data.length === 0) {
    if (error) console.error('getInviteLinkPreview error', error);
    return { familyName: null, isValid: false, reason: 'This invite link is invalid.' };
  }

  const row = data[0];
  return { familyName: row.family_name, isValid: row.is_valid, reason: row.reason };
}

/** Admin-only: active + past invite links for the family. */
export async function getFamilyInviteLinks(familyId: string): Promise<FamilyInviteLink[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any).rpc('get_family_invite_links', {
    p_family_id: familyId,
  });

  if (error || !data) {
    if (error) console.error('getFamilyInviteLinks error', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    familyId: row.family_id,
    token: row.token,
    role: row.role,
    createdBy: row.created_by,
    maxUses: row.max_uses,
    useCount: row.use_count,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}
