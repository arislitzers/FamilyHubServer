import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityRow } from '@/components/shared/activity-row';
import { ROUTES } from '@/constants/routes';
import type { ActivityEntry } from '@/types/activity.types';

export function FamilyActivityCard({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" /> Family activity
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
          <Link href={ROUTES.family}>
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-dusk-300 dark:text-dusk-500">
            Nothing&apos;s happened yet — add a planner event or post a check-in.
          </p>
        ) : (
          entries.map((entry) => <ActivityRow key={entry.id} entry={entry} compact />)
        )}
      </CardContent>
    </Card>
  );
}
