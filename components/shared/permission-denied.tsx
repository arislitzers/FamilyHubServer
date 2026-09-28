import { Lock } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * Drop-in state for when a signed-in user hits a resource they don't
 * have the role/permission to view (distinct from /unauthorized, which
 * is for missing auth entirely).
 */
export function PermissionDenied({
  title = "You don't have access to this",
  description = 'Ask a family admin if you think this is a mistake.',
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState icon={<Lock className="h-8 w-8" />} title={title} description={description} />;
}
