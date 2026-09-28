import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExportDataButton } from './export-data-button';
import { DeleteAccountDialog } from './delete-account-dialog';

export function PrivacyTab({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> Your data
          </CardTitle>
          <CardDescription>
            Only people in your family can see your profile, plans, and messages — and only what
            you&apos;ve chosen to share (see the privacy controls on your Profile and on individual
            planner events and reminders). FamilyHub doesn&apos;t share your data with third parties.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your data, exported</CardTitle>
          <CardDescription>
            Download a copy of your profile, reminders, prayer requests, journal entries, and
            check-ins as a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportDataButton />
        </CardContent>
      </Card>

      <div className="rounded-md border border-red-200 p-4 dark:border-red-500/30">
        <h3 className="mb-1 text-sm font-medium text-red-600 dark:text-red-400">Danger zone</h3>
        <p className="mb-3 text-xs text-dusk-400 dark:text-dusk-300">
          Permanently delete your account and everything you&apos;ve posted, including messages
          you&apos;ve sent. This cannot be undone.
        </p>
        <DeleteAccountDialog email={email} />
      </div>
    </div>
  );
}
