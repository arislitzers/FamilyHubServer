'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { joinViaInviteAction } from './actions';
import { ROUTES } from '@/constants/routes';

export function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const accept = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinViaInviteAction(token);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(ROUTES.dashboard);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button size="lg" onClick={accept} disabled={isPending} className="w-full">
        {isPending ? 'Joining...' : 'Join family'}
      </Button>
    </div>
  );
}
