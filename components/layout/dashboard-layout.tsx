import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { OfflineBanner } from '@/components/shared/offline-banner';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-linen-200 dark:bg-dusk-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <Topbar />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
