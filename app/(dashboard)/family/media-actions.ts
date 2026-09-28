'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';
import { FAMILY_FILES_BUCKET } from '@/types/media.types';

interface ActionResult {
  error: string | null;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function uploadFamilyMediaAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };

  const familyId = String(formData.get('familyId') ?? '');
  const file = formData.get('file') as File | null;

  if (!familyId) return { error: 'No family found.' };
  if (!file || file.size === 0) return { error: 'Choose a file to upload.' };
  if (file.size > MAX_FILE_SIZE_BYTES) return { error: 'Files must be under 25 MB.' };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${familyId}/${crypto.randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(FAMILY_FILES_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await (supabase as any).from('media').insert({
    family_id: familyId,
    uploaded_by: user.id,
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
  });

  if (insertError) {
    // Roll back the uploaded object so we don't leave an orphaned file
    // with no tracking row behind.
    await supabase.storage.from(FAMILY_FILES_BUCKET).remove([storagePath]);
    return { error: insertError.message };
  }

  revalidatePath(ROUTES.family);
  return { error: null };
}

export async function deleteFamilyMediaAction(mediaId: string): Promise<ActionResult> {
  const supabase = createClient();

  const { data: mediaRow, error: fetchError } = await (supabase as any)
    .from('media')
    .select('storage_path')
    .eq('id', mediaId)
    .maybeSingle();

  if (fetchError || !mediaRow) return { error: fetchError?.message ?? 'File not found.' };

  const { error: deleteRowError } = await (supabase as any).from('media').delete().eq('id', mediaId);
  if (deleteRowError) return { error: deleteRowError.message };

  await supabase.storage.from(FAMILY_FILES_BUCKET).remove([mediaRow.storage_path]);

  revalidatePath(ROUTES.family);
  return { error: null };
}
