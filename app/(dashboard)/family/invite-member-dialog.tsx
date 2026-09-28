'use client';

import { useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { addFamilyMemberAction } from '@/app/(dashboard)/family/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add member'}
    </Button>
  );
}

export function InviteMemberDialog({ familyId }: { familyId: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('member');
  const [state, formAction] = useFormState(addFamilyMemberAction, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" /> Add member
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Add a family member"
        description="They'll need a FamilyHub account already — invite them to sign up first if they don't have one."
      >
        <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="child">Child</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="role" value={role} />
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
