'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, UsersRound, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { NewDirectMessageDialog } from './new-direct-message-dialog';
import { CreateGroupDialog } from './create-group-dialog';
import type { ChatThread } from '@/types/chat.types';
import type { FamilyMemberWithProfile } from '@/types/family.types';

export function ThreadList({
  threads,
  selectedChatId,
  familyId,
  members,
  currentUserId,
}: {
  threads: ChatThread[];
  selectedChatId: string | null;
  familyId: string | null;
  members: FamilyMemberWithProfile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const hasFamilyThread = threads.some((t) => t.type === 'family');

  const selectThread = (chatId: string) => {
    router.push(`${pathname}?thread=${chatId}`);
  };

  const startFamilyChat = () => {
    if (!familyId) return;
    startTransition(async () => {
      const { data, error } = await (supabase as any).rpc('get_or_create_family_chat', {
        p_family_id: familyId,
      });
      if (!error && data) {
        router.push(`${pathname}?thread=${data.id}`);
      }
    });
  };

  return (
    <div className="flex h-full flex-col border-r border-linen-300 dark:border-dusk-600">
      <div className="flex flex-col gap-2 border-b border-linen-300 p-4 dark:border-dusk-600">
        <h2 className="font-display text-lg text-dusk-700 dark:text-linen-100">Chats</h2>
        {familyId && (
          <div className="flex gap-2">
            <NewDirectMessageDialog members={members} currentUserId={currentUserId} />
            <CreateGroupDialog familyId={familyId} members={members} currentUserId={currentUserId} />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {!hasFamilyThread && familyId && (
          <button
            onClick={startFamilyChat}
            disabled={isPending}
            className="mb-2 flex w-full items-center gap-3 rounded-md border border-dashed border-linen-400 p-3 text-left text-sm text-dusk-500 transition-colors hover:border-hearth-300 hover:text-hearth-500 dark:border-dusk-500 dark:text-dusk-200"
          >
            <Users className="h-4 w-4" /> Start the family chat
          </button>
        )}

        {threads.length === 0 && hasFamilyThread === false && !familyId && (
          <p className="p-3 text-sm text-dusk-300 dark:text-dusk-500">
            Set up your family to start chatting.
          </p>
        )}

        {threads.map((thread) => {
          const isFamily = thread.type === 'family';
          const isGroup = thread.type === 'group';
          const label = isFamily
            ? thread.chatName ?? 'Family chat'
            : isGroup
              ? thread.chatName ?? 'Group'
              : thread.otherUserName ?? 'Direct message';
          const isSelected = thread.chatId === selectedChatId;

          return (
            <button
              key={thread.chatId}
              onClick={() => selectThread(thread.chatId)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors',
                isSelected
                  ? 'bg-hearth-100 dark:bg-hearth-900/30'
                  : 'hover:bg-linen-300 dark:hover:bg-dusk-700'
              )}
            >
              {isFamily ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hearth-400 text-white">
                  <Users className="h-4 w-4" />
                </div>
              ) : isGroup ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dusk-500 text-white">
                  <UsersRound className="h-4 w-4" />
                </div>
              ) : (
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={thread.otherUserAvatar ?? undefined} alt={label} />
                  <AvatarFallback>{getInitials(label)}</AvatarFallback>
                </Avatar>
              )}

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-medium text-dusk-700 dark:text-linen-100">
                  {isGroup && <Lock className="h-3 w-3 shrink-0 text-dusk-300" />}
                  <span className="truncate">{label}</span>
                  {isGroup && (
                    <span className="shrink-0 text-xs font-normal text-dusk-300 dark:text-dusk-500">
                      · {thread.memberCount}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-dusk-400 dark:text-dusk-300">
                  {thread.lastMessage ?? 'No messages yet'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
