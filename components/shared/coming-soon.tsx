import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';

export function ComingSoonPage({
  title,
  description,
  icon,
  emptyStateTitle,
  emptyStateDescription,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="outline">Coming soon</Badge>}
      />
      <EmptyState icon={icon} title={emptyStateTitle} description={emptyStateDescription} />
    </div>
  );
}
