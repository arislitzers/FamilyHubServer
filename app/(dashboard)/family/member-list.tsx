'use client';

import { useState, useTransition } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInitials } from '@/lib/utils';
import { updateMemberRoleAction, removeMemberAction } from '@/app/(dashboard)/family/actions';
import type { FamilyMemberWithProfile, FamilyRole } from '@/types/family.types';

const ROLE_LABELS: Record<FamilyRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  child: 'Child',
};

const ROLE_BADGE_VARIANT: Record<FamilyRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
  child: 'outline',
};

export function MemberList({
  members,
  currentUserId,
  isAdmin,
}: {
  members: FamilyMemberWithProfile[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (memberId: string, role: FamilyRole) => {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, role);
      if (result.error) setError(result.error);
    });
  };

  const handleRemove = (memberId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {members.map((member) => {
        const displayName = member.profile?.displayName || member.fullName || member.email;
        const isSelf = member.userId === currentUserId;

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-md border border-linen-300 bg-white p-4 dark:border-dusk-600 dark:bg-dusk-800"
          >
            <Avatar>
              <AvatarImage src={member.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-dusk-700 dark:text-linen-100">
                {displayName} {isSelf && <span className="text-dusk-300">(you)</span>}
              </p>
              <p className="truncate text-xs text-dusk-400 dark:text-dusk-300">{member.email}</p>
            </div>

            <Badge variant={ROLE_BADGE_VARIANT[member.role]}>{ROLE_LABELS[member.role]}</Badge>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending} aria-label="Member options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change role</DropdownMenuLabel>
                  {(['owner', 'admin', 'member', 'child'] as FamilyRole[]).map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleChange(member.id, role)}
                      className="justify-between"
                    >
                      {ROLE_LABELS[role]}
                      {member.role === role && <span className="text-hearth-500">•</span>}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRemove(member.id)}
                    className="gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Remove from family
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
