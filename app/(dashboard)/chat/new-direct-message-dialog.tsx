'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';
import type { FamilyMemberWithProfile } from '@/types/family.types';

export function NewDirectMessageDialog({
  members,
  currentUserId,
}: {
  members: FamilyMemberWithProfile[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const others = members.filter((m) => m.userId !== currentUserId);

  const startChat = (otherUserId: string) => {
    setError(null);
    startTransition(async () => {
      const { data, error } = await (supabase as any).rpc('get_or_create_direct_chat', {
        p_other_user_id: otherUserId,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setOpen(false);
      router.push(`${ROUTES.chat}?thread=${data.id}`);
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <MessageCirclePlus className="h-4 w-4" /> New message
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Start a direct message">
        <div className="mt-4 flex flex-col gap-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {others.length === 0 ? (
            <p className="text-sm text-dusk-400 dark:text-dusk-200">
              No other family members yet — invite someone from the Family page first.
            </p>
          ) : (
            others.map((member) => {
              const displayName = member.profile?.displayName || member.fullName || member.email;
              return (
                <button
                  key={member.id}
                  onClick={() => startChat(member.userId)}
                  disabled={isPending}
                  className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-linen-300 dark:hover:bg-dusk-700"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatarUrl ?? undefined} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-dusk-700 dark:text-linen-100">
                    {displayName}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}
