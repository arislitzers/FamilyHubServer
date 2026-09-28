'use client';

import { useState, useTransition } from 'react';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { ActivityRow } from '@/components/shared/activity-row';
import { loadMoreActivityAction } from './activity-actions';
import type { ActivityEntry } from '@/types/activity.types';

const PAGE_SIZE = 20;

export function ActivityFeedTab({
  familyId,
  initialEntries,
}: {
  familyId: string;
  initialEntries: ActivityEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [hasMore, setHasMore] = useState(initialEntries.length === PAGE_SIZE);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    const last = entries[entries.length - 1];
    if (!last) return;

    startTransition(async () => {
      const next = await loadMoreActivityAction(familyId, last.createdAt);
      setEntries((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    });
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="h-8 w-8" />}
        title="No activity yet"
        description="As your family plans, prays, and checks in together, it'll show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} />
      ))}

      {hasMore && (
        <Button
          variant="outline"
          onClick={loadMore}
          disabled={isPending}
          className="mx-auto w-fit"
        >
          {isPending ? 'Loading...' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
