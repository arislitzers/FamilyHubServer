'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ROUTES } from '@/constants/routes';
import { SITE } from '@/constants/site';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dusk-700/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2 text-linen-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-dusk-900">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-display text-lg">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-linen-300 transition-colors hover:text-linen-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild className="text-linen-100 hover:bg-white/10">
            <Link href={ROUTES.login}>Log in</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.register}>Get started</Link>
          </Button>
        </div>

        <button
          className="text-linen-100 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-dusk-700 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-linen-200" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" asChild className="border-white/20 text-linen-100">
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.register}>Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
