'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Link2, Copy, Check, Ban, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { SITE } from '@/constants/site';
import { createInviteLinkAction, revokeInviteLinkAction } from './actions';
import type { FamilyInviteLink } from '@/types/family.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create link'}
    </Button>
  );
}

function CreateLinkDialog({ familyId }: { familyId: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('member');
  const [state, formAction] = useFormState(createInviteLinkAction, { error: null });

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> New invite link
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create an invite link"
        description="Anyone with this link joins instantly — no approval needed. Only share it with people you trust."
      >
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="familyId" value={familyId} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              Role for people who join
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="maxUses" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                Max uses <span className="text-dusk-300">(optional)</span>
              </label>
              <input
                id="maxUses"
                name="maxUses"
                type="number"
                min={1}
                placeholder="Unlimited"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="expiresInHours"
                className="text-sm font-medium text-dusk-600 dark:text-linen-200"
              >
                Expires in <span className="text-dusk-300">(hours)</span>
              </label>
              <input
                id="expiresInHours"
                name="expiresInHours"
                type="number"
                min={1}
                placeholder="Never"
                className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
              />
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

function LinkRow({ link }: { link: FamilyInviteLink }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const url = `${SITE.url}/join/${link.token}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revoke = () => {
    startTransition(() => {
      revokeInviteLinkAction(link.id);
    });
  };

  const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
  const isUsedUp = link.maxUses ? link.useCount >= link.maxUses : false;
  const isLive = link.isActive && !isExpired && !isUsedUp;

  return (
    <div className="flex items-center gap-3 rounded-md border border-linen-300 p-3 dark:border-dusk-600">
      <Link2 className="h-4 w-4 shrink-0 text-dusk-300 dark:text-dusk-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs text-dusk-600 dark:text-dusk-200">{url}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-dusk-400 dark:text-dusk-400">
          <Badge variant="outline" className="capitalize">
            {link.role}
          </Badge>
          <span>
            {link.useCount} use{link.useCount === 1 ? '' : 's'}
            {link.maxUses ? ` / ${link.maxUses}` : ''}
          </span>
          {link.expiresAt && (
            <span>
              · expires {formatDate(link.expiresAt, { month: 'short', day: 'numeric', year: undefined })}
            </span>
          )}
          {!isLive && (
            <Badge variant="secondary" className="text-[10px]">
              {!link.isActive ? 'Revoked' : isExpired ? 'Expired' : 'Used up'}
            </Badge>
          )}
        </div>
      </div>

      {isLive && (
        <>
          <Button variant="outline" size="icon" onClick={copy} aria-label="Copy link">
            {copied ? <Check className="h-4 w-4 animate-check-pop text-sage-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={revoke}
            disabled={isPending}
            aria-label="Revoke link"
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Ban className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export function InviteLinksPanel({
  familyId,
  links,
}: {
  familyId: string;
  links: FamilyInviteLink[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Invite links</CardTitle>
          <CardDescription>Instant join — no approval required.</CardDescription>
        </div>
        <CreateLinkDialog familyId={familyId} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {links.length === 0 ? (
          <p className="text-sm text-dusk-300 dark:text-dusk-500">No invite links yet.</p>
        ) : (
          links.map((link) => <LinkRow key={link.id} link={link} />)
        )}
      </CardContent>
    </Card>
  );
}
