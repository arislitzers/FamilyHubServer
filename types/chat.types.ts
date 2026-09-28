export type ChatType = 'direct' | 'family' | 'group';
export type ChatParticipantRole = 'admin' | 'member';

export interface ChatThread {
  chatId: string;
  type: ChatType;
  familyId: string | null;
  chatName: string | null;
  otherUserId: string | null;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  memberCount: number;
  /** The current user's role in this specific chat — only meaningful for
   * 'group' chats (direct/family threads don't use participant roles). */
  myRole: ChatParticipantRole | null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  isEdited: boolean;
  createdAt: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentMimeType: string | null;
  attachmentSizeBytes: number | null;
  /** Resolved client-side after fetch/realtime insert, since the bucket
   * is private — see message-thread.tsx. */
  attachmentUrl?: string | null;
}

export interface GroupMember {
  userId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: ChatParticipantRole;
}
