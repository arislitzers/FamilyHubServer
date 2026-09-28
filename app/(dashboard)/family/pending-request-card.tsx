import { Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { PendingJoinRequest } from '@/types/family.types';

export function PendingRequestCard({ request }: { request: PendingJoinRequest }) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hearth-100 text-hearth-600 dark:bg-hearth-900/40 dark:text-hearth-200">
            <Clock3 className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl text-dusk-700 dark:text-linen-100">
            Waiting for approval
          </h1>
          <p className="text-sm text-dusk-400 dark:text-dusk-200">
            Your request to join <span className="font-medium">{request.familyName}</span> was
            sent {formatDate(request.requestedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', year: undefined })}.
            An admin needs to approve it before you can get in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
