'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { leaveFamilyAction } from './actions';

export function LeaveFamilyDialog({ familyName }: { familyName: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const confirmLeave = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveFamilyAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-fit gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" /> Leave family
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`Leave ${familyName}?`}
        description="You'll lose access to the family's planner, chat, reminders, and photos. You can rejoin later with the family code or a new invite."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmLeave}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? 'Leaving...' : 'Leave family'}
            </Button>
          </>
        }
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Modal>
    </>
  );
}
