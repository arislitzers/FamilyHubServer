import { HandHeart } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { CreatePrayerRequestDialog } from './create-prayer-request-dialog';
import { PrayerRequestCard } from './prayer-request-card';
import type { PrayerGroupOption, PrayerRequest } from '@/types/prayer.types';

export function RequestsTab({
  requests,
  familyId,
  groups,
  currentUserId,
  isAdmin,
}: {
  requests: PrayerRequest[];
  familyId: string;
  groups: PrayerGroupOption[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <CreatePrayerRequestDialog familyId={familyId} groups={groups} />
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<HandHeart className="h-8 w-8" />}
          title="No active prayer requests"
          description="Share what's on your heart — your family (or a group) can pray alongside you."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <PrayerRequestCard
              key={request.id}
              request={request}
              canManage={isAdmin || request.createdBy === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
