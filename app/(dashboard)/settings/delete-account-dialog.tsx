'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';

const CONFIRM_PHRASE = 'DELETE';

export function DeleteAccountDialog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const canDelete = confirmText.trim() === CONFIRM_PHRASE;

  const confirmDelete = async () => {
    if (!canDelete) return;
    setError(null);
    setIsDeleting(true);

    const response = await fetch('/api/account/delete', { method: 'POST' });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? 'Something went wrong.');
      setIsDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.push(ROUTES.home);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-fit gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" /> Delete my account
      </Button>

      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmText('');
        }}
        title="Delete your account?"
        description={`This permanently deletes your FamilyHub account (${email}), your profile, and everything you've posted — including messages you've sent in any chat. This cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={!canDelete || isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
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
            Type <span className="font-semibold">{CONFIRM_PHRASE}</span> to confirm.
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
