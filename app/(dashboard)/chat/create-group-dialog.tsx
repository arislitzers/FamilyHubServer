'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { UsersRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { createGroupChatAction } from './group-actions';
import { ROUTES } from '@/constants/routes';
import type { FamilyMemberWithProfile } from '@/types/family.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create group'}
    </Button>
  );
}

export function CreateGroupDialog({
  familyId,
  members,
  currentUserId,
}: {
  familyId: string;
  members: FamilyMemberWithProfile[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [state, formAction] = useFormState(createGroupChatAction, { error: null });
  const router = useRouter();

  const others = members.filter((m) => m.userId !== currentUserId);

  useEffect(() => {
    if (state.chatId) {
      router.push(`${ROUTES.chat}?thread=${state.chatId}`);
    }
  }, [state.chatId, router]);

  const toggleMember = (userId: string) => {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <UsersRound className="h-4 w-4" /> New group
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create a private group"
        description="Only the people you pick can see this group or its messages — not even family admins get automatic access."
      >
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Group name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Weekend planning, Kids only"
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-dusk-600 dark:text-linen-200">
              <Lock className="h-3.5 w-3.5" /> Members
            </span>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-linen-300 p-2 dark:border-dusk-600">
              {others.length === 0 ? (
                <p className="p-2 text-sm text-dusk-300 dark:text-dusk-500">
                  No other family members to add yet.
                </p>
              ) : (
                others.map((member) => {
                  const displayName = member.profile?.displayName || member.fullName || member.email;
                  const checked = selected.includes(member.userId);
                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-linen-300 dark:hover:bg-dusk-700"
                    >
                      <input
                        type="checkbox"
                        name="memberIds"
                        value={member.userId}
                        checked={checked}
                        onChange={() => toggleMember(member.userId)}
                        className="h-4 w-4 rounded border-linen-400"
                      />
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={member.avatarUrl ?? undefined} alt={displayName} />
                        <AvatarFallback className="text-[10px]">{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-dusk-700 dark:text-linen-100">{displayName}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
