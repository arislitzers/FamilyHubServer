export interface MediaItem {
  id: string;
  familyId: string;
  uploadedBy: string;
  uploaderName: string | null;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  url: string | null; // signed URL, resolved server-side per request
}

export const PUBLIC_MEDIA_BUCKET = 'public-media';
export const FAMILY_FILES_BUCKET = 'family-files';
export const CHAT_FILES_BUCKET = 'chat-files';

export function isImageMimeType(mimeType: string | null): boolean {
  return !!mimeType && mimeType.startsWith('image/');
}

export function isVideoMimeType(mimeType: string | null): boolean {
  return !!mimeType && mimeType.startsWith('video/');
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
