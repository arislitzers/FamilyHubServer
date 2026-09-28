'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
}

/**
 * Updates the profile row belonging to the given family_member_id.
 * RLS (see database/002_family_and_profiles.sql) already restricts this
 * to rows where family_members.user_id = auth.uid(), so a mismatched id
 * simply fails silently at the database layer rather than needing an
 * extra check here.
 */
export async function updateProfileAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();

  const familyMemberId = String(formData.get('familyMemberId') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const relationship = String(formData.get('relationship') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const birthday = String(formData.get('birthday') ?? '').trim();
  const colorTag = String(formData.get('colorTag') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();

  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      display_name: displayName || null,
      nickname: nickname || null,
      relationship: relationship || null,
      bio: bio || null,
      birthday: birthday || null,
      color_tag: colorTag || null,
      phone: phone || null,
      contact_email: contactEmail || null,
    })
    .eq('family_member_id', familyMemberId);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.profiles);
  revalidatePath(ROUTES.family);
  return { error: null };
}

export async function updatePrivacySettingAction(
  familyMemberId: string,
  field: 'phone' | 'birthday' | 'contact_email',
  value: 'family' | 'private'
): Promise<ActionResult> {
  const supabase = createClient();

  const { data: current } = await (supabase as any)
    .from('profiles')
    .select('privacy_settings')
    .eq('family_member_id', familyMemberId)
    .maybeSingle();

  const nextSettings = {
    ...(current?.privacy_settings as Record<string, string> | undefined),
    [field]: value,
  };

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ privacy_settings: nextSettings })
    .eq('family_member_id', familyMemberId);

  if (error) return { error: error.message };

  revalidatePath(ROUTES.profiles);
  return { error: null };
}

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadAvatarAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) return { error: 'Choose an image to upload.' };
  if (file.size > MAX_AVATAR_SIZE_BYTES) return { error: 'Avatars must be under 5 MB.' };
  if (!file.type.startsWith('image/')) return { error: 'Avatar must be an image.' };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `avatars/${user.id}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('public-media')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('public-media').getPublicUrl(storagePath);

  const { error: updateError } = await (supabase as any)
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath(ROUTES.profiles);
  revalidatePath(ROUTES.family);
  revalidatePath(ROUTES.chat);
  return { error: null };
}
