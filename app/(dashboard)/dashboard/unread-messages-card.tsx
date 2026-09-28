import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import type { UnreadMessagesSummary } from '@/services/dashboard.service';

export function UnreadMessagesCard({ summary }: { summary: UnreadMessagesSummary }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" /> Messages
        </CardTitle>
        {summary.count > 0 && <Badge>{summary.count} unread</Badge>}
      </CardHeader>
      <CardContent>
        {summary.count === 0 ? (
          <p className="py-2 text-sm text-dusk-300 dark:text-dusk-500">You&apos;re all caught up.</p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-medium text-dusk-700 dark:text-linen-100">
              {summary.latestTitle}
            </p>
            {summary.latestPreview && (
              <p className="truncate text-sm text-dusk-400 dark:text-dusk-300">
                {summary.latestPreview}
              </p>
            )}
          </div>
        )}
        <Button variant="outline" size="sm" asChild className="mt-3 w-fit">
          <Link href={ROUTES.chat}>Open chat</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
