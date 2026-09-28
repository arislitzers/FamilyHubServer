import { Cake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { UpcomingBirthday } from '@/lib/schedule-utils';

function daysUntilLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Today!';
  if (daysUntil === 1) return 'Tomorrow';
  return `In ${daysUntil} days`;
}

export function UpcomingBirthdaysCard({ birthdays }: { birthdays: UpcomingBirthday[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-4 w-4" /> Upcoming birthdays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <p className="py-4 text-center text-sm text-dusk-300 dark:text-dusk-500">
            No birthdays on file yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {birthdays.map((b) => (
              <div key={b.familyMemberId} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={b.avatarUrl ?? undefined} alt={b.name} />
                  <AvatarFallback>{getInitials(b.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dusk-700 dark:text-linen-100">
                    {b.name}
                    {b.turningAge && (
                      <span className="ml-1 text-dusk-400 dark:text-dusk-300">turns {b.turningAge}</span>
                    )}
                  </p>
                </div>
                <span
                  className={
                    b.daysUntil <= 1
                      ? 'text-xs font-medium text-hearth-500'
                      : 'text-xs text-dusk-400 dark:text-dusk-300'
                  }
                >
                  {daysUntilLabel(b.daysUntil)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
