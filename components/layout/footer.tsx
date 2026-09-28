import Link from 'next/link';
import { Home } from 'lucide-react';
import { SITE } from '@/constants/site';
import { ROUTES } from '@/constants/routes';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Log in', href: ROUTES.login },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-dusk-900 px-6 py-12 text-linen-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <Link href={ROUTES.home} className="flex items-center gap-2 text-linen-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-dusk-900">
                <Home className="h-4 w-4" />
              </span>
              <span className="font-display text-lg">{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-linen-400">{SITE.tagline}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-medium text-linen-100">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-linen-400 hover:text-linen-100">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-linen-500">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
