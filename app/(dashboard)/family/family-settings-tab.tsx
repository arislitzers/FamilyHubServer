import { FamilyCodeCard } from './family-code-card';
import { InviteLinksPanel } from './invite-links-panel';
import { JoinRequestsPanel } from './join-requests-panel';
import { PermissionsReference } from './permissions-reference';
import { LeaveFamilyDialog } from './leave-family-dialog';
import { DeleteFamilyDialog } from './delete-family-dialog';
import type { FamilyJoinRequest, FamilyInviteLink, FamilyRole } from '@/types/family.types';

export function FamilySettingsTab({
  familyId,
  familyName,
  familyCode,
  myRole,
  isAdmin,
  isOwner,
  joinRequests,
  inviteLinks,
}: {
  familyId: string;
  familyName: string;
  familyCode: string;
  myRole: FamilyRole | null;
  isAdmin: boolean;
  isOwner: boolean;
  joinRequests: FamilyJoinRequest[];
  inviteLinks: FamilyInviteLink[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <FamilyCodeCard familyId={familyId} familyCode={familyCode} isAdmin={isAdmin} />

      {isAdmin && <JoinRequestsPanel requests={joinRequests} />}
      {isAdmin && <InviteLinksPanel familyId={familyId} links={inviteLinks} />}

      <PermissionsReference />

      <div className="rounded-md border border-red-200 p-4 dark:border-red-500/30">
        <h3 className="mb-1 text-sm font-medium text-red-600 dark:text-red-400">Danger zone</h3>
        <p className="mb-3 text-xs text-dusk-400 dark:text-dusk-300">
          {isOwner
            ? "Leaving requires promoting another owner first. Deleting removes the family for everyone, permanently."
            : 'Leaving removes your access to this family. You can rejoin later with a code or invite link.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <LeaveFamilyDialog familyName={familyName} />
          {isOwner && <DeleteFamilyDialog familyId={familyId} familyName={familyName} />}
        </div>
      </div>
    </div>
  );
}
