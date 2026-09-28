import { PageHeader } from '@/components/shared/page-header';
import { NotificationFeed } from './notification-feed';

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" description="Everything you need to know, in one feed." />
      <NotificationFeed />
    </div>
  );
}
