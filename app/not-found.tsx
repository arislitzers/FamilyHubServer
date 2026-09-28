import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dusk-gradient px-6 text-center text-linen-100">
      <p className="font-mono text-sm tracking-widest text-hearth-300">404</p>
      <h1 className="max-w-md text-balance font-display text-4xl">
        This room in the house doesn&apos;t exist.
      </h1>
      <p className="max-w-sm text-linen-300">
        The page you&apos;re looking for may have moved, or never existed.
      </p>
      <Button asChild className="mt-4">
        <Link href={ROUTES.home}>Back home</Link>
      </Button>
    </main>
  );
}
