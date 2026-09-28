'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ThreadList } from './thread-list';
import { MessageThread } from './message-thread';
import { GroupManagementDialog } from './group-management-dialog';
import type { ChatThread } from '@/types/chat.types';
import type { FamilyMemberWithProfile } from '@/types/family.types';

export function ChatShell({
  threads,
  familyId,
  members,
  currentUserId,
}: {
  threads: ChatThread[];
  familyId: string | null;
  members: FamilyMemberWithProfile[];
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedChatId = searchParams.get('thread');

  const selectedThread = threads.find((t) => t.chatId === selectedChatId) ?? null;
  const isGroup = selectedThread?.type === 'group';
  const selectedLabel = selectedThread
    ? selectedThread.type === 'family'
      ? selectedThread.chatName ?? 'Family chat'
      : isGroup
        ? selectedThread.chatName ?? 'Group'
        : selectedThread.otherUserName ?? 'Direct message'
    : null;

  return (
    <div className="grid h-[calc(100vh-9.5rem)] overflow-hidden rounded-lg border border-linen-300 bg-white dark:border-dusk-600 dark:bg-dusk-800 md:h-[calc(100vh-8rem)] md:grid-cols-[20rem_1fr]">
      {/* Desktop: both panes side by side. Mobile: show one at a time. */}
      <div className={selectedChatId ? 'hidden md:block' : 'block'}>
        <ThreadList
          threads={threads}
          selectedChatId={selectedChatId}
          familyId={familyId}
          members={members}
          currentUserId={currentUserId}
        />
      </div>

      <div className={selectedChatId ? 'flex flex-col' : 'hidden md:flex md:flex-col'}>
        {selectedChatId && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 border-b border-linen-300 p-3 text-sm text-dusk-500 dark:border-dusk-600 dark:text-dusk-200 md:hidden"
          >
            <ChevronLeft className="h-4 w-4" /> Back to chats
          </button>
        )}
        <MessageThread
          chatId={selectedChatId}
          chatLabel={selectedLabel}
          currentUserId={currentUserId}
          members={members}
          headerAction={
            isGroup && selectedThread ? (
              <GroupManagementDialog
                chatId={selectedThread.chatId}
                chatName={selectedThread.chatName ?? 'Group'}
                isAdmin={selectedThread.myRole === 'admin'}
                familyMembers={members}
                currentUserId={currentUserId}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
