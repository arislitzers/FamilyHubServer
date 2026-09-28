import type { ReactNode } from 'react';

/**
 * The most generic layout in the system — just a centered, padded
 * content column. Used for one-off pages that don't fit the marketing,
 * auth, or dashboard shells.
 */
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linen-200 dark:bg-dusk-900">
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
