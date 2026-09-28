import { FileText, Download } from 'lucide-react';
import { isImageMimeType, isVideoMimeType, formatFileSize } from '@/types/media.types';
import type { ChatMessage } from '@/types/chat.types';

export function MessageAttachment({ message }: { message: ChatMessage }) {
  if (!message.attachmentPath) return null;

  if (!message.attachmentUrl) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-black/5 px-3 py-2 text-xs text-dusk-400 dark:bg-white/5 dark:text-dusk-300">
        <FileText className="h-4 w-4" /> {message.attachmentName ?? 'Attachment'} (loading...)
      </div>
    );
  }

  if (isImageMimeType(message.attachmentMimeType)) {
    return (
      <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={message.attachmentUrl}
          alt={message.attachmentName ?? 'Image'}
          className="max-h-64 w-auto rounded-md object-cover"
        />
      </a>
    );
  }

  if (isVideoMimeType(message.attachmentMimeType)) {
    return (
      <video controls className="max-h-64 w-auto rounded-md">
        <source src={message.attachmentUrl} type={message.attachmentMimeType ?? undefined} />
      </video>
    );
  }

  return (
    <a
      href={message.attachmentUrl}
      target="_blank"
      rel="noreferrer"
      download={message.attachmentName ?? undefined}
      className="flex items-center gap-2 rounded-md bg-black/5 px-3 py-2 text-xs transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{message.attachmentName ?? 'Attachment'}</span>
      {message.attachmentSizeBytes && (
        <span className="shrink-0 opacity-70">{formatFileSize(message.attachmentSizeBytes)}</span>
      )}
      <Download className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
