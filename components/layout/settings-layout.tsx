import type { ReactNode } from 'react';

/**
 * Settings gets its own layout nested inside DashboardLayout: same shell,
 * a max-width content column, and a page title. The actual section tabs
 * live in app/(dashboard)/settings/page.tsx now that each tab has real
 * content — keeping the tab state there means it can be a single
 * Tabs/TabsContent tree instead of a decorative strip disconnected from
 * what's rendered below it.
 */
export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-dusk-700 dark:text-linen-100">Settings</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}
