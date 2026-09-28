'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';

interface ActionResult {
  error: string | null;
  chatId?: string;
}

export async function createGroupChatAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const familyId = String(formData.get('familyId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const memberIds = formData.getAll('memberIds').map(String);

  if (!name) return { error: 'Group name is required.' };

  const { data, error } = await (supabase as any).rpc('create_group_chat', {
    p_family_id: familyId,
    p_name: name,
    p_member_user_ids: memberIds,
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.chat);
  return { error: null, chatId: data?.id };
}

export async function addGroupMemberAction(chatId: string, userId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('add_group_member', {
    p_chat_id: chatId,
    p_user_id: userId,
  });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}

export async function removeGroupMemberAction(chatId: string, userId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('remove_group_member', {
    p_chat_id: chatId,
    p_user_id: userId,
  });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}

export async function promoteGroupMemberAction(chatId: string, userId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('promote_group_member', {
    p_chat_id: chatId,
    p_user_id: userId,
  });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}

export async function leaveGroupChatAction(chatId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('leave_group_chat', { p_chat_id: chatId });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}

export async function renameGroupChatAction(chatId: string, name: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('rename_group_chat', {
    p_chat_id: chatId,
    p_name: name,
  });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}

export async function deleteGroupChatAction(chatId: string) {
  const supabase = createClient();
  const { error } = await (supabase as any).rpc('delete_group_chat', { p_chat_id: chatId });

  revalidatePath(ROUTES.chat);
  return { error: error?.message ?? null };
}
