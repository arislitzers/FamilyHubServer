'use client';

import { useState, useTransition } from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInitials } from '@/lib/utils';
import { approveJoinRequestAction, denyJoinRequestAction } from './actions';
import type { FamilyJoinRequest } from '@/types/family.types';

export function JoinRequestsPanel({ requests }: { requests: FamilyJoinRequest[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const approve = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await approveJoinRequestAction(id);
      if (result.error) setError(result.error);
    });
  };

  const deny = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await denyJoinRequestAction(id);
      if (result.error) setError(result.error);
    });
  };

  if (requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4" /> Join requests
        </CardTitle>
        <CardDescription>People who&apos;ve requested to join with your family code.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {requests.map((request) => {
          const displayName = request.fullName || request.email;
          return (
            <div
              key={request.requestId}
              className="flex items-center gap-3 rounded-md border border-linen-300 p-3 dark:border-dusk-600"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={request.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-dusk-700 dark:text-linen-100">
                  {displayName}
                </p>
                <p className="truncate text-xs text-dusk-400 dark:text-dusk-300">{request.email}</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => approve(request.requestId)}
                disabled={isPending}
                aria-label="Approve"
                className="text-sage-600 hover:bg-sage-50 dark:hover:bg-sage-600/10"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => deny(request.requestId)}
                disabled={isPending}
                aria-label="Deny"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
