'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Crown, UserMinus, UserPlus, Trash2, LogOut, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  addGroupMemberAction,
  removeGroupMemberAction,
  promoteGroupMemberAction,
  leaveGroupChatAction,
  renameGroupChatAction,
  deleteGroupChatAction,
} from './group-actions';
import { ROUTES } from '@/constants/routes';
import type { GroupMember } from '@/types/chat.types';
import type { FamilyMemberWithProfile } from '@/types/family.types';

export function GroupManagementDialog({
  chatId,
  chatName,
  isAdmin,
  familyMembers,
  currentUserId,
}: {
  chatId: string;
  chatName: string;
  isAdmin: boolean;
  familyMembers: FamilyMemberWithProfile[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(chatName);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (supabase as any)
      .rpc('get_group_members', { p_chat_id: chatId })
      .then(({ data, error }: any) => {
        if (!error && data) {
          setMembers(
            data.map((row: any) => ({
              userId: row.user_id,
              fullName: row.full_name,
              email: row.email,
              avatarUrl: row.avatar_url,
              role: row.role,
            }))
          );
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chatId]);

  const memberIds = new Set(members.map((m) => m.userId));
  const addable = familyMembers.filter((m) => !memberIds.has(m.userId));

  const runAction = (fn: () => Promise<{ error: string | null }>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      // Refresh the member list in place.
      const { data } = await (supabase as any).rpc('get_group_members', { p_chat_id: chatId });
      if (data) {
        setMembers(
          data.map((row: any) => ({
            userId: row.user_id,
            fullName: row.full_name,
            email: row.email,
            avatarUrl: row.avatar_url,
            role: row.role,
          }))
        );
      }
    });
  };

  const saveRename = () => {
    runAction(
      () => renameGroupChatAction(chatId, nameDraft),
      () => setRenaming(false)
    );
  };

  const handleLeave = () => {
    runAction(() => leaveGroupChatAction(chatId), () => {
      setOpen(false);
      router.push(ROUTES.chat);
    });
  };

  const handleDelete = () => {
    runAction(() => deleteGroupChatAction(chatId), () => {
      setOpen(false);
      router.push(ROUTES.chat);
    });
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Manage group">
        <Settings className="h-4 w-4" />
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Group settings">
        <div className="mt-2 flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            {renaming ? (
              <>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-9 flex-1 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                />
                <Button size="icon" variant="outline" onClick={saveRename} disabled={isPending} aria-label="Save name">
                  <Check className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <p className="flex-1 font-display text-lg text-dusk-700 dark:text-linen-100">{chatName}</p>
                {isAdmin && (
                  <Button size="icon" variant="ghost" onClick={() => setRenaming(true)} aria-label="Rename group">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Members ({members.length})
              </p>
              {isAdmin && addable.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {addable.map((m) => {
                      const name = m.profile?.displayName || m.fullName || m.email;
                      return (
                        <DropdownMenuItem
                          key={m.userId}
                          onClick={() => runAction(() => addGroupMemberAction(chatId, m.userId))}
                        >
                          {name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-dusk-300 dark:text-dusk-500">Loading...</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {members.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  const name = member.fullName || member.email;
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 rounded-md border border-linen-300 p-2.5 dark:border-dusk-600"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl ?? undefined} alt={name} />
                        <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-dusk-700 dark:text-linen-100">
                          {name} {isSelf && <span className="text-dusk-300">(you)</span>}
                        </p>
                      </div>
                      {member.role === 'admin' && (
                        <Badge variant="outline" className="gap-1">
                          <Crown className="h-3 w-3" /> Admin
                        </Badge>
                      )}
                      {isAdmin && !isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Member options">
                              <UserMinus className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== 'admin' && (
                              <DropdownMenuItem
                                onClick={() => runAction(() => promoteGroupMemberAction(chatId, member.userId))}
                              >
                                Make admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => runAction(() => removeGroupMemberAction(chatId, member.userId))}
                              className="text-red-600"
                            >
                              Remove from group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 border-t border-linen-200 pt-4 dark:border-dusk-700">
            <Button
              variant="outline"
              onClick={handleLeave}
              disabled={isPending}
              className="gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Leave group
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isPending}
                className="gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Delete group
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
