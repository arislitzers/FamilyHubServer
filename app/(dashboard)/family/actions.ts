'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';
import type { FamilyRole } from '@/types/family.types';

interface ActionResult {
  error: string | null;
}

export async function createFamilyAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) return { error: 'Family name is required.' };

  const { error } = await (supabase as any).rpc('create_family', {
    p_name: name,
    p_description: description || null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}

export async function addFamilyMemberAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyId = String(formData.get('familyId') ?? '');
  const email = String(formData.get('email') ?? '').trim();
  const role = (String(formData.get('role') ?? 'member') as FamilyRole) ?? 'member';

  if (!email) return { error: 'Email is required.' };

  const { error } = await (supabase as any).rpc('add_family_member_by_email', {
    p_family_id: familyId,
    p_email: email,
    p_role: role,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  return { error: null };
}

export async function updateMemberRoleAction(memberId: string, role: FamilyRole) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('update_family_member_role', {
    p_member_id: memberId,
    p_role: role,
  });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

export async function removeMemberAction(memberId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('remove_family_member', { p_member_id: memberId });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

export async function updateFamilyDetailsAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyId = String(formData.get('familyId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) return { error: 'Family name is required.' };

  const { error } = await (supabase as any)
    .from('families')
    .update({ name, description: description || null })
    .eq('id', familyId);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  return { error: null };
}

const MAX_COVER_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadFamilyCoverAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyId = String(formData.get('familyId') ?? '');
  const file = formData.get('file') as File | null;

  if (!familyId) return { error: 'No family found.' };
  if (!file || file.size === 0) return { error: 'Choose an image to upload.' };
  if (file.size > MAX_COVER_SIZE_BYTES) return { error: 'Cover images must be under 8 MB.' };
  if (!file.type.startsWith('image/')) return { error: 'Cover photo must be an image.' };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `family-covers/${familyId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('public-media')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('public-media').getPublicUrl(storagePath);

  const { error: updateError } = await (supabase as any)
    .from('families')
    .update({ cover_image_url: publicUrl })
    .eq('id', familyId);

  if (updateError) return { error: updateError.message };

  revalidatePath(ROUTES.family);
  return { error: null };
}

// ----------------------------------------------------------------------------
// Join by family code
// ----------------------------------------------------------------------------
export async function requestToJoinFamilyAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyCode = String(formData.get('familyCode') ?? '').trim();

  if (!familyCode) return { error: 'Enter a family code.' };

  const { error } = await (supabase as any).rpc('request_to_join_family', {
    p_family_code: familyCode,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  return { error: null };
}

export async function regenerateFamilyCodeAction(familyId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('regenerate_family_code', {
    p_family_id: familyId,
  });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Join requests (admin approve/deny)
// ----------------------------------------------------------------------------
export async function approveJoinRequestAction(requestId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('approve_join_request', {
    p_request_id: requestId,
  });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

export async function denyJoinRequestAction(requestId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('deny_join_request', { p_request_id: requestId });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Invite links
// ----------------------------------------------------------------------------
export async function createInviteLinkAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyId = String(formData.get('familyId') ?? '');
  const role = String(formData.get('role') ?? 'member');
  const maxUsesRaw = String(formData.get('maxUses') ?? '').trim();
  const expiresRaw = String(formData.get('expiresInHours') ?? '').trim();

  const { error } = await (supabase as any).rpc('create_invite_link', {
    p_family_id: familyId,
    p_role: role,
    p_max_uses: maxUsesRaw ? Number(maxUsesRaw) : null,
    p_expires_in_hours: expiresRaw ? Number(expiresRaw) : null,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  return { error: null };
}

export async function revokeInviteLinkAction(linkId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('revoke_invite_link', { p_link_id: linkId });

  revalidatePath(ROUTES.family);
  return { error: error?.message ?? null };
}

// ----------------------------------------------------------------------------
// Leave / delete family
// ----------------------------------------------------------------------------
export async function leaveFamilyAction(): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('leave_family');

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}

export async function deleteFamilyAction(familyId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('delete_family', { p_family_id: familyId });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.family);
  revalidatePath(ROUTES.dashboard);
  return { error: null };
}
