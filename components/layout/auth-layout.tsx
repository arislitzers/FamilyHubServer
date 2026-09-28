import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { SITE } from '@/constants/site';

/**
 * Two-pane layout for every auth screen: a branded panel on the left
 * (hidden on mobile) and the form itself on the right.
 */
export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-dusk-gradient p-10 text-linen-100 lg:flex">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-hearth-400 text-dusk-900">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-display text-lg">{SITE.name}</span>
        </Link>
        <div className="max-w-md">
          <p className="font-display text-3xl leading-snug text-balance">{SITE.tagline}</p>
          <p className="mt-4 text-linen-300">{SITE.description}</p>
        </div>
        <p className="text-xs text-linen-400">© {new Date().getFullYear()} {SITE.name}</p>
      </div>

      <div className="flex flex-col items-center justify-center bg-linen-200 px-6 py-12 dark:bg-dusk-900">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href={ROUTES.home} className="flex items-center gap-2 text-dusk-700 dark:text-linen-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-white">
                <Home className="h-4 w-4" />
              </span>
              <span className="font-display text-lg">{SITE.name}</span>
            </Link>
          </div>
          <h1 className="font-display text-2xl text-dusk-700 dark:text-linen-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-dusk-400 dark:text-dusk-200">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
