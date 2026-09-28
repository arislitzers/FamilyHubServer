'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { deleteFamilyAction } from './actions';

export function DeleteFamilyDialog({ familyId, familyName }: { familyId: string; familyName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canDelete = confirmText.trim() === familyName;

  const confirmDelete = () => {
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteFamilyAction(familyId);
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
        <Trash2 className="h-4 w-4" /> Delete family
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmText('');
        }}
        title="Delete this family?"
        description="This permanently deletes every member, profile, plan, reminder, message, and file for this family. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={!canDelete || isPending}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-dusk-500 dark:text-dusk-200">
            Type <span className="font-semibold">{familyName}</span> to confirm.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-red-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
          />
        </div>
      </Modal>
    </>
  );
}
