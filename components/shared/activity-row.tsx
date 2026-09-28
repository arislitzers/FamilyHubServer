import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ActivityTypeIcon } from '@/components/shared/activity-icon';
import { getInitials } from '@/lib/utils';
import type { ActivityEntry } from '@/types/activity.types';

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ActivityRow({ entry, compact = false }: { entry: ActivityEntry; compact?: boolean }) {
  const name = entry.actorName ?? 'Someone';

  return (
    <div className="flex items-start gap-3">
      {!compact && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={entry.actorAvatar ?? undefined} alt={name} />
          <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
        </Avatar>
      )}
      {compact && (
        <ActivityTypeIcon actionType={entry.actionType} className="mt-0.5 h-4 w-4 shrink-0 text-hearth-400" />
      )}
      <p className="text-sm text-dusk-600 dark:text-dusk-200">
        <span className="font-medium text-dusk-700 dark:text-linen-100">{name}</span>{' '}
        {entry.summary}
        <span className="ml-1.5 text-xs text-dusk-300 dark:text-dusk-500">{timeAgo(entry.createdAt)}</span>
      </p>
    </div>
  );
}
