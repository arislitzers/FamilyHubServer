import { createClient } from '@/lib/supabase/server';
import type { ChatMessage, ChatThread, GroupMember } from '@/types/chat.types';

export async function getMyChatThreads(): Promise<ChatThread[]> {
  const supabase = createClient();

  // `as any` here for the same reason documented in services/families.service.ts
  // and the README: our hand-written Database type doesn't carry the
  // Relationships metadata Supabase's generated types would, which this
  // supabase-js version needs for precise RPC return-type inference.
  const { data, error } = await (supabase as any).rpc('get_my_chat_threads');

  if (error || !data) {
    if (error) console.error('getMyChatThreads error', error);
    return [];
  }

  return data.map((row: any) => ({
    chatId: row.chat_id,
    type: row.type,
    familyId: row.family_id,
    chatName: row.chat_name,
    otherUserId: row.other_user_id,
    otherUserName: row.other_user_name,
    otherUserAvatar: row.other_user_avatar,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    memberCount: row.member_count ?? 0,
    myRole: row.my_role ?? null,
  }));
}

/** Initial message page for a thread — realtime picks up anything after this. */
export async function getChatMessages(chatId: string, limit = 50): Promise<ChatMessage[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('messages')
    .select('id, chat_id, sender_id, content, is_edited, created_at, attachment_path, attachment_name, attachment_mime_type, attachment_size_bytes')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('getChatMessages error', error);
    return [];
  }

  return data.map((row: any) => ({
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
  }));
}

/** Member list + roles for a group chat's management panel. */
export async function getGroupMembers(chatId: string): Promise<GroupMember[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as any).rpc('get_group_members', { p_chat_id: chatId });

  if (error || !data) {
    if (error) console.error('getGroupMembers error', error);
    return [];
  }

  return data.map((row: any) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
  }));
}
