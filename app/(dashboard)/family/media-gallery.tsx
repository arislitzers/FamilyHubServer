'use client';

import { useRef, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Upload, FileText, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import { uploadFamilyMediaAction, deleteFamilyMediaAction } from './media-actions';
import { isImageMimeType, formatFileSize } from '@/types/media.types';
import type { MediaItem } from '@/types/media.types';

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      <Upload className="h-4 w-4" /> {pending ? 'Uploading...' : 'Upload'}
    </Button>
  );
}

function UploadForm({ familyId }: { familyId: string }) {
  const [state, formAction] = useFormState(uploadFamilyMediaAction, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded-md border border-dashed border-linen-400 p-4 dark:border-dusk-500"
    >
      <input type="hidden" name="familyId" value={familyId} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <input
          type="file"
          name="file"
          required
          className="text-sm text-dusk-500 file:mr-3 file:rounded-md file:border-0 file:bg-hearth-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-hearth-700 dark:text-dusk-200 dark:file:bg-hearth-900/40 dark:file:text-hearth-200"
        />
        <UploadButton />
      </div>
      <p className="text-xs text-dusk-300 dark:text-dusk-500">Photos or documents, up to 25 MB.</p>
    </form>
  );
}

function MediaCard({ item, canManage }: { item: MediaItem; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();
  const isImage = isImageMimeType(item.mimeType);

  const remove = () => {
    startTransition(() => {
      deleteFamilyMediaAction(item.id);
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-md border border-linen-300 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted dark:border-dusk-600 dark:bg-dusk-800">
      <div className="flex aspect-square items-center justify-center bg-linen-200 dark:bg-dusk-900">
        {isImage && item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.fileName} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-10 w-10 text-dusk-300 dark:text-dusk-500" />
        )}
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-dusk-700 dark:text-linen-100">
          {item.fileName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-dusk-300 dark:text-dusk-400">
          {item.uploaderName ?? 'Someone'} ·{' '}
          {formatDate(item.createdAt, { month: 'short', day: 'numeric', year: undefined })}
          {item.sizeBytes ? ` · ${formatFileSize(item.sizeBytes)}` : ''}
        </p>
      </div>

      <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            download={item.fileName}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-dusk-600 shadow-soft hover:bg-white"
            aria-label="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
        {canManage && (
          <button
            onClick={remove}
            disabled={isPending}
            aria-label="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft hover:bg-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function MediaGallery({
  familyId,
  items,
  currentUserId,
  isAdmin,
}: {
  familyId: string;
  items: MediaItem[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <UploadForm familyId={familyId} />

      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-8 w-8" />}
          title="No photos or files yet"
          description="Upload the first one — birthday photos, school documents, whatever your family wants to keep together."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              canManage={isAdmin || item.uploadedBy === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
