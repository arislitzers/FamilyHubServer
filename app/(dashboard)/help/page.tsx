import { HelpCircle } from 'lucide-react';
import { ComingSoonPage } from '@/components/shared/coming-soon';

export default function HelpPage() {
  return (
    <ComingSoonPage
      title="Help"
      description="Guides, FAQs, and ways to reach support."
      icon={<HelpCircle className="h-8 w-8" />}
      emptyStateTitle="Help center is on the way"
      emptyStateDescription="Documentation and support contact options will be available here."
    />
  );
}
