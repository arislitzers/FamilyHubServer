import { CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PrayerRequestCard } from './prayer-request-card';
import type { PrayerRequest } from '@/types/prayer.types';

export function AnsweredTab({
  requests,
  currentUserId,
  isAdmin,
}: {
  requests: PrayerRequest[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-8 w-8" />}
        title="No answered prayers yet"
        description="When a prayer request is marked answered, it shows up here — a record of what your family has seen come through."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((request) => (
        <PrayerRequestCard
          key={request.id}
          request={request}
          canManage={isAdmin || request.createdBy === currentUserId}
        />
      ))}
    </div>
  );
}
