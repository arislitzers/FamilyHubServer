import { createClient } from '@/lib/supabase/server';
import { FAMILY_FILES_BUCKET } from '@/types/media.types';
import type { MediaItem } from '@/types/media.types';

/**
 * Fetches a family's media rows and resolves a signed URL for each in one
 * batched call (createSignedUrls), rather than one round trip per file.
 * Signed URLs expire — this always generates fresh ones per request
 * rather than caching, which keeps `family-files` genuinely private.
 */
export async function getFamilyMedia(familyId: string, limit = 60): Promise<MediaItem[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('media')
    .select('id, family_id, uploaded_by, storage_path, file_name, mime_type, size_bytes, created_at, users(full_name)')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (error) console.error('getFamilyMedia error', error);
    return [];
  }

  const paths = data.map((row: any) => row.storage_path);
  const { data: signedUrls, error: signError } = await supabase.storage
    .from(FAMILY_FILES_BUCKET)
    .createSignedUrls(paths, 60 * 60); // 1 hour

  if (signError) console.error('createSignedUrls error', signError);

  const urlByPath = new Map<string, string>();
  (signedUrls ?? []).forEach((entry) => {
    if (entry.path && entry.signedUrl) urlByPath.set(entry.path, entry.signedUrl);
  });

  return data.map((row: any) => ({
    id: row.id,
    familyId: row.family_id,
    uploadedBy: row.uploaded_by,
    uploaderName: row.users?.full_name ?? null,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    url: urlByPath.get(row.storage_path) ?? null,
  }));
}
