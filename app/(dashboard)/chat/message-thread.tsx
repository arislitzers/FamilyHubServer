'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, Paperclip, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { EmojiPickerButton } from '@/components/shared/emoji-picker-button';
import { cn, getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { CHAT_FILES_BUCKET, formatFileSize } from '@/types/media.types';
import { MessageAttachment } from './message-attachment';
import type { ChatMessage } from '@/types/chat.types';
import type { FamilyMemberWithProfile } from '@/types/family.types';

interface ParticipantInfo {
  name: string;
  avatarUrl: string | null;
}

const ATTACHMENT_COLUMNS =
  'id, chat_id, sender_id, content, is_edited, created_at, attachment_path, attachment_name, attachment_mime_type, attachment_size_bytes';
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB

function mapRow(row: any): ChatMessage {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    content: row.content,
    isEdited: row.is_edited,
    createdAt: row.created_at,
    attachmentPath: row.attachment_path,
    attachmentName: row.attachment_name,
    attachmentMimeType: row.attachment_mime_type,
    attachmentSizeBytes: row.attachment_size_bytes,
  };
}

export function MessageThread({
  chatId,
  chatLabel,
  currentUserId,
  members,
  headerAction,
}: {
  chatId: string | null;
  chatLabel: string | null;
  currentUserId: string;
  members: FamilyMemberWithProfile[];
  headerAction?: React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const participantMap: Record<string, ParticipantInfo> = {};
  for (const m of members) {
    participantMap[m.userId] = {
      name: m.profile?.displayName || m.fullName || m.email,
      avatarUrl: m.avatarUrl,
    };
  }

  /** Resolves a signed URL for any attachment that doesn't have one yet
   * (bucket is private — see database/016_chat_attachments.sql). */
  const resolveAttachmentUrls = async (msgs: ChatMessage[]): Promise<ChatMessage[]> => {
    const needsUrl = msgs.filter((m) => m.attachmentPath && !m.attachmentUrl);
    if (needsUrl.length === 0) return msgs;

    const paths = needsUrl.map((m) => m.attachmentPath!);
    const { data } = await supabase.storage.from(CHAT_FILES_BUCKET).createSignedUrls(paths, 60 * 60);
    const urlByPath = new Map<string, string>();
    (data ?? []).forEach((entry) => {
      if (entry.path && entry.signedUrl) urlByPath.set(entry.path, entry.signedUrl);
    });

    return msgs.map((m) =>
      m.attachmentPath ? { ...m, attachmentUrl: urlByPath.get(m.attachmentPath) ?? m.attachmentUrl } : m
    );
  };

  useEffect(() => {
    if (!chatId) return;

    let isMounted = true;
    setLoading(true);

    (supabase as any)
      .from('messages')
      .select(ATTACHMENT_COLUMNS)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(async ({ data, error }: any) => {
        if (!isMounted) return;
        if (!error && data) {
          const mapped = data.map(mapRow);
          setMessages(await resolveAttachmentUrls(mapped));
        }
        setLoading(false);
      });

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const row = mapRow(payload.new);
          const [withUrl] = await resolveAttachmentUrls([row]);
          const finalMessage = withUrl ?? row;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, finalMessage]));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const insertEmoji = (emoji: string) => {
    setDraft((prev) => prev + emoji);
    draftInputRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError('Files must be under 25 MB.');
      e.target.value = '';
      return;
    }
    setPendingFile(file);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if ((!content && !pendingFile) || !chatId || sending) return;

    setSending(true);
    setUploadError(null);

    let attachmentFields: Record<string, unknown> = {};

    if (pendingFile) {
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${chatId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(CHAT_FILES_BUCKET)
        .upload(path, pendingFile, { contentType: pendingFile.type || undefined });

      if (uploadError) {
        setUploadError(uploadError.message);
        setSending(false);
        return;
      }

      attachmentFields = {
        attachment_path: path,
        attachment_name: pendingFile.name,
        attachment_mime_type: pendingFile.type || null,
        attachment_size_bytes: pendingFile.size,
      };
    }

    setDraft('');
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const { error } = await (supabase as any).from('messages').insert({
      chat_id: chatId,
      sender_id: currentUserId,
      content: content || null,
      ...attachmentFields,
    });

    if (error) {
      // Put the draft back so nothing is silently lost.
      setDraft(content);
      setUploadError(error.message);
    }
    setSending(false);
  };

  if (!chatId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<MessageCircle className="h-8 w-8" />}
          title="Select a conversation"
          description="Pick the family chat or a direct message from the left to get started."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-linen-300 p-4 dark:border-dusk-600">
        <p className="font-medium text-dusk-700 dark:text-linen-100">{chatLabel}</p>
        {headerAction}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-dusk-300 dark:text-dusk-500">
            No messages yet — say hello.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              const author = participantMap[message.senderId];
              return (
                <div
                  key={message.id}
                  className={cn('flex items-end gap-2', isMine && 'flex-row-reverse')}
                >
                  {!isMine && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={author?.avatarUrl ?? undefined} alt={author?.name ?? ''} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(author?.name ?? '?')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'flex max-w-[75%] flex-col gap-1.5 rounded-2xl px-3.5 py-2 text-sm',
                      isMine
                        ? 'rounded-br-sm bg-hearth-400 text-white'
                        : 'rounded-bl-sm bg-linen-300 text-dusk-700 dark:bg-dusk-700 dark:text-linen-100'
                    )}
                  >
                    {message.attachmentPath && <MessageAttachment message={message} />}
                    {message.content && <span>{message.content}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-linen-300 p-3 dark:border-dusk-600">
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        {pendingFile && (
          <div className="flex items-center gap-2 rounded-md bg-linen-300 px-3 py-2 text-xs text-dusk-600 dark:bg-dusk-700 dark:text-dusk-200">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{pendingFile.name}</span>
            <span className="shrink-0 opacity-70">{formatFileSize(pendingFile.size)}</span>
            <button
              onClick={() => {
                setPendingFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              aria-label="Remove attachment"
              className="shrink-0 text-dusk-400 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-dusk-400 transition-colors hover:bg-linen-300 hover:text-dusk-600 dark:text-dusk-300 dark:hover:bg-dusk-700 dark:hover:text-linen-100"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>

          <EmojiPickerButton onSelect={insertEmoji} align="start" />

          <input
            ref={draftInputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="h-10 flex-1 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={sending || (!draft.trim() && !pendingFile)}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
