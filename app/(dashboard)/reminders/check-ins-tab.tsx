import { HeartHandshake } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { CheckInComposer } from './check-in-composer';
import { CheckInCard } from './check-in-card';
import type { CheckIn } from '@/types/reminders.types';

export function CheckInsTab({
  familyId,
  checkIns,
  currentUserId,
  isAdmin,
}: {
  familyId: string | null;
  checkIns: CheckIn[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  if (!familyId) {
    return (
      <EmptyState
        icon={<HeartHandshake className="h-8 w-8" />}
        title="Set up your family first"
        description="Check-ins are shared with your family — head to the Family page to create one."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CheckInComposer familyId={familyId} />

      {checkIns.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="h-8 w-8" />}
          title="No check-ins yet"
          description="Post the first one — let your family know how things are going."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {checkIns.map((checkIn) => (
            <CheckInCard
              key={checkIn.id}
              checkIn={checkIn}
              canDelete={isAdmin || checkIn.userId === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
